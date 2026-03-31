// ===========================================================
// ADMIN DASHBOARD CONTROLLER
// ===========================================================

let editShipmentModal = null;
let addClientModal = null;
let currentEditingShipmentId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Check auth
    if (!authManager.isAuthenticated()) {
        authManager.redirectToLogin();
        return;
    }

    // Set username
    document.getElementById('userUsername').textContent = authManager.getUsername();

    // Initialize modals
    editShipmentModal = new bootstrap.Modal(document.getElementById('editShipmentModal'));
    addClientModal = new bootstrap.Modal(document.getElementById('addClientModal'));

    // Populate city suggestions
    populateCitySuggestions();

    // Load initial data
    await loadDashboard();
    await loadAllShipments();
    await loadClients();

    // Setup event listeners
    document.getElementById('newShipmentForm').addEventListener('submit', handleCreateShipment);
    document.getElementById('addClientForm').addEventListener('submit', handleAddClient);

    // Listen for real-time updates
    window.addEventListener('shipmentsUpdated', loadDashboard);
    window.addEventListener('shipmentsUpdated', loadAllShipments);
    window.addEventListener('clientsUpdated', loadClients);

    // Also check for storage changes from other tabs
    syncManager.subscribe((type) => {
        if (type === 'axonShipments') {
            loadDashboard();
            loadAllShipments();
        } else if (type === 'axonClients') {
            loadClients();
        }
    });
});

// ===========================================================
// POPULATE CITY SUGGESTIONS
// ===========================================================

function populateCitySuggestions() {
    const datalist = document.getElementById('citySuggestions');
    if (!datalist) return;
    
    datalist.innerHTML = '';
    const allLocations = getAllLocationsByNames();
    
    allLocations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.label;
        datalist.appendChild(option);
    });
}

function buildAddressObject(input) {
    const normalizedInput = String(input || '').trim();
    if (!normalizedInput) return null;

    const knownLocation = getAllLocationsByNames().find(loc =>
        (loc.label && loc.label.toLowerCase() === normalizedInput.toLowerCase()) ||
        (loc.city && loc.city.toLowerCase() === normalizedInput.toLowerCase())
    );
    if (knownLocation) {
        return {
            city: knownLocation.city || normalizedInput,
            state: knownLocation.state || '',
            country: knownLocation.country || '',
            label: knownLocation.label || normalizedInput,
            lat: knownLocation.lat,
            lng: knownLocation.lng
        };
    }

    const parts = normalizedInput
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);

    return {
        city: parts[0] || normalizedInput,
        state: parts.length > 2 ? parts[1] : '',
        country: parts.length >= 2 ? parts[parts.length - 1] : '',
        label: normalizedInput,
        lat: null,
        lng: null
    };
}

// ===========================================================
// DASHBOARD FUNCTIONS
// ===========================================================

async function loadDashboard() {
    const shipments = await dataManager.getShipments();
    
    let totalCount = shipments.length;
    let inTransitCount = shipments.filter(s => ['picked-up', 'in-transit', 'out-for-delivery'].includes(s.status)).length;
    let deliveredCount = shipments.filter(s => s.status === 'delivered').length;
    let pendingCount = shipments.filter(s => s.status === 'pending').length;

    document.getElementById('totalShipments').textContent = totalCount;
    document.getElementById('inTransit').textContent = inTransitCount;
    document.getElementById('delivered').textContent = deliveredCount;
    document.getElementById('pending').textContent = pendingCount;

    // Load recent shipments
    const recentShipments = shipments.slice(0, 10);
    const tbody = document.getElementById('recentShipmentsTable');
    tbody.innerHTML = '';

    if (recentShipments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #9ca3af; padding: 40px;">No shipments yet. Create one to get started.</td></tr>';
        return;
    }

    recentShipments.forEach(shipment => {
        const row = document.createElement('tr');
        const originLabel = shipment.origin?.label || shipment.origin?.city || 'N/A';
        const destLabel = shipment.destination?.label || shipment.destination?.city || 'N/A';
        
        row.innerHTML = `
            <td><strong>${shipment.trackingNumber || 'N/A'}</strong></td>
            <td>${originLabel} - ${destLabel}</td>
            <td>${shipment.senderName || 'N/A'}</td>
            <td>
                <span class="status-badge ${getStatusBadgeClass(shipment.status)}">
                    ${getStatusLabel(shipment.status)}
                </span>
            </td>
            <td>${shipment.createdDate ? formatDate(shipment.createdDate) : 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="openEditShipmentModal('${shipment.id}')">
                        <i class="fas fa-edit"></i> Update
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteShipment('${shipment.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ===========================================================
// SHIPMENT MANAGEMENT
// ===========================================================

async function loadAllShipments() {
    const shipments = await dataManager.getShipments();
    const tbody = document.getElementById('allShipmentsTable');
    tbody.innerHTML = '';

    if (shipments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #9ca3af; padding: 40px;"><i class="fas fa-inbox" style="font-size: 2rem; opacity: 0.5;"></i><br>No shipments found</td></tr>';
        return;
    }

    shipments.forEach(shipment => {
        const row = document.createElement('tr');
        const originLabel = shipment.origin?.label || shipment.origin?.city || 'N/A';
        const destLabel = shipment.destination?.label || shipment.destination?.city || 'N/A';
        const deliveryDate = shipment.estimatedDeliveryDate ? formatDate(shipment.estimatedDeliveryDate) : 'N/A';
        
        row.innerHTML = `
            <td>${shipment.id || 'N/A'}</td>
            <td><strong>${shipment.trackingNumber || 'N/A'}</strong></td>
            <td>${originLabel}</td>
            <td>${destLabel}</td>
            <td>${shipment.senderName || 'N/A'}</td>
            <td>${shipment.weight || 'N/A'} kg</td>
            <td>
                <span class="status-badge ${getStatusBadgeClass(shipment.status)}">
                    ${getStatusLabel(shipment.status)}
                </span>
            </td>
            <td>${deliveryDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="openEditShipmentModal('${shipment.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteShipment('${shipment.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function handleCreateShipment(e) {
    e.preventDefault();

    const originInput = document.getElementById('formOrigin').value;
    const destinationInput = document.getElementById('formDestination').value;
    const origin = buildAddressObject(originInput);
    const destination = buildAddressObject(destinationInput);

    if (!origin) {
        showNotification('Please enter an origin address', 'error');
        return;
    }
    if (!destination) {
        showNotification('Please enter a destination address', 'error');
        return;
    }

    const shipment = {
        senderName: document.getElementById('formSender').value,
        senderContact: document.getElementById('formSenderContact').value,
        receiverName: document.getElementById('formReceiver').value,
        receiverContact: document.getElementById('formReceiverContact').value,
        origin: {
            city: origin.city,
            label: origin.label,
            state: origin.state || '',
            country: origin.country || '',
            lat: origin.lat ?? null,
            lng: origin.lng ?? null
        },
        destination: {
            city: destination.city,
            label: destination.label,
            state: destination.state || '',
            country: destination.country || '',
            lat: destination.lat ?? null,
            lng: destination.lng ?? null
        },
        weight: document.getElementById('formWeight').value,
        estimatedDeliveryDate: document.getElementById('formDeliveryDate').value,
        direction: document.getElementById('formDirection').value,
        status: document.getElementById('formStatus').value
    };

    try {
        await dataManager.addShipment(shipment);
        showNotification('Shipment created successfully!', 'success');
        document.getElementById('newShipmentForm').reset();
        document.getElementById('shipments-tab').click();
        await loadDashboard();
        await loadAllShipments();
    } catch (error) {
        console.error('Error creating shipment:', error);
        showNotification('Failed to create shipment', 'error');
    }
}

async function openEditShipmentModal(shipmentId) {
    currentEditingShipmentId = shipmentId;
    const shipment = await dataManager.getShipmentById(shipmentId);

    if (!shipment) {
        showNotification('Shipment not found', 'error');
        return;
    }

    document.getElementById('modalTrackingNumber').textContent = shipment.trackingNumber;
    document.getElementById('modalCurrentStatus').textContent = getStatusLabel(shipment.status);
    document.getElementById('modalNewStatus').value = shipment.status;
    document.getElementById('modalLocation').value = shipment.currentLocation?.label || '';
    document.getElementById('modalMessage').value = '';
    document.getElementById('modalDirection').value = shipment.direction || '';

    editShipmentModal.show();
}

async function saveShipmentUpdate() {
    if (!currentEditingShipmentId) return;

    const newStatus = document.getElementById('modalNewStatus').value;
    const location = document.getElementById('modalLocation').value;
    const message = document.getElementById('modalMessage').value;
    const direction = document.getElementById('modalDirection').value;

    if (!location || !message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    try {
        await dataManager.updateShipmentStatus(
            currentEditingShipmentId,
            newStatus,
            message,
            location,
            direction
        );
        
        showNotification('Shipment updated successfully!', 'success');
        editShipmentModal.hide();
        await loadDashboard();
        await loadAllShipments();
    } catch (error) {
        console.error('Error updating shipment:', error);
        showNotification('Failed to update shipment', 'error');
    }
}

async function deleteShipment(shipmentId) {
    if (!confirm('Are you sure you want to delete this shipment?')) return;

    try {
        await dataManager.deleteShipment(shipmentId);
        showNotification('Shipment deleted successfully!', 'success');
        await loadDashboard();
        await loadAllShipments();
    } catch (error) {
        console.error('Error deleting shipment:', error);
        showNotification('Failed to delete shipment', 'error');
    }
}

function filterShipments() {
    const filter = document.getElementById('shipmentFilter').value.toLowerCase();
    const rows = document.getElementById('allShipmentsTable').querySelectorAll('tr');

    rows.forEach(row => {
        const trackingNumber = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        row.style.display = trackingNumber.includes(filter) ? '' : 'none';
    });
}

// ===========================================================
// CLIENT MANAGEMENT
// ===========================================================

async function loadClients() {
    const clients = await dataManager.getClients();
    const tbody = document.getElementById('clientsTable');
    tbody.innerHTML = '';

    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #9ca3af; padding: 40px;"><i class="fas fa-users" style="font-size: 2rem; opacity: 0.5;"></i><br>No clients added yet</td></tr>';
        return;
    }

    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.id || 'N/A'}</td>
            <td>${client.name || 'N/A'}</td>
            <td>${client.email || 'N/A'}</td>
            <td>${client.phone || 'N/A'}</td>
            <td>${client.address || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-danger btn-sm" onclick="deleteClient('${client.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAddClientModal() {
    document.getElementById('addClientForm').reset();
    addClientModal.show();
}

async function handleAddClient(e) {
    e.preventDefault();

    const client = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value
    };

    try {
        await dataManager.addClient(client);
        showNotification('Client added successfully!', 'success');
        document.getElementById('addClientForm').reset();
        addClientModal.hide();
        await loadClients();
    } catch (error) {
        console.error('Error adding client:', error);
        showNotification('Failed to add client', 'error');
    }
}

async function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
        await dataManager.deleteClient(clientId);
        showNotification('Client deleted successfully!', 'success');
        await loadClients();
    } catch (error) {
        console.error('Error deleting client:', error);
        showNotification('Failed to delete client', 'error');
    }
}

// ===========================================================
// UI HELPERS
// ===========================================================

function switchTab(tabId) {
    const tab = document.getElementById(tabId + '-tab');
    if (tab) tab.click();
}

function showUserMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('userMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function viewProfile() {
    const username = authManager.getUsername();
    showNotification(`Logged in as: ${username}`, 'success');
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        dataManager.logout();
    }
}

// Close menu when clicking outside
document.addEventListener('click', function() {
    document.getElementById('userMenu').style.display = 'none';
});
