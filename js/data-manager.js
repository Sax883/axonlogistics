// =============================================================================
// REAL-TIME SYNC ENGINE WITH WEBSOCKET SUPPORT
// =============================================================================

class RealTimeSyncManager {
    constructor() {
        this.listeners = [];
        this.syncInterval = null;
        this.lastSyncTime = 0;
        this.syncDebounceMs = 500;
        this.initLocalStorage();
        this.startRealTimeSync();
    }

    initLocalStorage() {
        if (!localStorage.getItem('axonShipments')) {
            localStorage.setItem('axonShipments', JSON.stringify([]));
        }
        if (!localStorage.getItem('axonClients')) {
            localStorage.setItem('axonClients', JSON.stringify([]));
        }
        if (!localStorage.getItem('axonSyncMetadata')) {
            localStorage.setItem('axonSyncMetadata', JSON.stringify({
                lastSync: Date.now(),
                deviceId: this.generateDeviceId()
            }));
        }
    }

    generateDeviceId() {
        let deviceId = localStorage.getItem('axonDeviceId');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('axonDeviceId', deviceId);
        }
        return deviceId;
    }

    startRealTimeSync() {
        // Check for changes every 2 seconds
        this.syncInterval = setInterval(() => {
            this.broadcastChanges();
        }, 2000);

        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === 'axonShipments' || e.key === 'axonClients') {
                this.notifyListeners(e.key);
            }
        });
    }

    broadcastChanges() {
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncDebounceMs) return;
        
        this.lastSyncTime = now;
        const metadata = JSON.parse(localStorage.getItem('axonSyncMetadata') || '{}');
        metadata.lastSync = now;
        metadata.deviceId = this.generateDeviceId();
        localStorage.setItem('axonSyncMetadata', JSON.stringify(metadata));
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners(type) {
        this.listeners.forEach(cb => cb(type));
    }

    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

const syncManager = new RealTimeSyncManager();

// =============================================================================
// AUTHENTICATION & SESSION MANAGER
// =============================================================================

class AuthManager {
    constructor() {
        this.SESSION_KEY = 'axon_admin_session';
        this.SESSION_TIMEOUT = 8 * 60 * 60 * 1000;
    }

    isAuthenticated() {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (!session) return false;

        try {
            const data = JSON.parse(session);
            const now = Date.now();
            if (data.timestamp + this.SESSION_TIMEOUT > now && data.authenticated === true) {
                return true;
            }
        } catch (e) {
            localStorage.removeItem(this.SESSION_KEY);
        }
        return false;
    }

    redirectToLogin() {
        window.location.href = 'login.html';
    }

    getUsername() {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (session) {
            try {
                return JSON.parse(session).username || 'Admin';
            } catch (e) {
                return 'Admin';
            }
        }
        return 'Admin';
    }

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    }
}

const authManager = new AuthManager();

// =============================================================================
// DATA MANAGER WITH REAL-TIME SYNC
// =============================================================================

class DataManager {
    constructor() {
        if (!authManager.isAuthenticated()) {
            authManager.redirectToLogin();
        }
        this.initializeData();
        this.setupSyncListeners();
    }

    initializeData() {
        if (!localStorage.getItem('axonShipments')) {
            localStorage.setItem('axonShipments', JSON.stringify([]));
        }
        if (!localStorage.getItem('axonClients')) {
            localStorage.setItem('axonClients', JSON.stringify([]));
        }
    }

    setupSyncListeners() {
        syncManager.subscribe((type) => {
            if (type === 'axonShipments') {
                this.onShipmentsUpdated();
            } else if (type === 'axonClients') {
                this.onClientsUpdated();
            }
        });
    }

    onShipmentsUpdated() {
        window.dispatchEvent(new Event('shipmentsUpdated'));
    }

    onClientsUpdated() {
        window.dispatchEvent(new Event('clientsUpdated'));
    }

    // SHIPMENT METHODS
    async getShipments() {
        const data = localStorage.getItem('axonShipments');
        return data ? JSON.parse(data) : [];
    }

    async getShipmentByTracking(trackingNumber) {
        const shipments = await this.getShipments();
        return shipments.find(s => s.trackingNumber === trackingNumber.trim());
    }

    async getShipmentById(id) {
        const shipments = await this.getShipments();
        return shipments.find(s => s.id === id);
    }

    async addShipment(shipment) {
        const timestamp = Date.now().toString().slice(-3);
        shipment.id = 'AXN' + timestamp;
        shipment.trackingNumber = `${shipment.id}-2026-${timestamp}`;
        
        const originLabel = shipment.origin.city + 
            (shipment.origin.state ? ', ' + shipment.origin.state : '') +
            (shipment.origin.country ? ', ' + shipment.origin.country : '');
        
        const destinationLabel = shipment.destination.city + 
            (shipment.destination.state ? ', ' + shipment.destination.state : '') +
            (shipment.destination.country ? ', ' + shipment.destination.country : '');

        shipment.createdDate = new Date().toISOString();
        shipment.updates = [
            { 
                date: new Date().toISOString().split('T')[0], 
                time: new Date().toTimeString().split(' ')[0], 
                status: shipment.status || 'pending', 
                message: 'Shipment created and registered', 
                location: originLabel 
            }
        ];
        
        shipment.currentLocation = {
            lat: shipment.origin.lat,
            lng: shipment.origin.lng,
            label: originLabel
        };

        shipment.destinationLocation = {
            lat: shipment.destination.lat,
            lng: shipment.destination.lng,
            label: destinationLabel,
            direction: shipment.direction || null
        };

        const shipments = await this.getShipments();
        shipments.unshift(shipment);
        localStorage.setItem('axonShipments', JSON.stringify(shipments));
        this.onShipmentsUpdated();
        return shipment;
    }

    async updateShipment(id, updates) {
        const shipments = await this.getShipments();
        const index = shipments.findIndex(s => s.id === id);
        if (index !== -1) {
            shipments[index] = { ...shipments[index], ...updates };
            localStorage.setItem('axonShipments', JSON.stringify(shipments));
            this.onShipmentsUpdated();
            return shipments[index];
        }
        throw new Error('Shipment not found');
    }

    async updateShipmentStatus(id, status, message, location, direction = null) {
        const shipment = await this.getShipmentById(id);
        if (!shipment) return;

        const updateEntry = {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            status: status,
            message: message,
            location: location,
            direction: direction
        };

        const updatedUpdates = [...(shipment.updates || []), updateEntry];
        
        let currentLocation = shipment.currentLocation;
        try {
            const cityName = String(location).split(',')[0].trim();
            const pool = [...MAJOR_CITIES, ...SUGGESTED_LOCATIONS];
            
            const cityObj = pool.find(c => 
                (c.city && c.city.toLowerCase() === cityName.toLowerCase()) || 
                (c.label && c.label.toLowerCase() === String(location).toLowerCase())
            );
            
            if (cityObj) {
                const label = cityObj.label || `${cityObj.city}${cityObj.state ? ', ' + cityObj.state : ''}`;
                currentLocation = { lat: cityObj.lat, lng: cityObj.lng, label: label };
            }
        } catch (err) { }

        return await this.updateShipment(id, { 
            status: status, 
            updates: updatedUpdates,
            currentLocation: currentLocation,
            lastUpdated: new Date().toISOString(),
            updatedBy: authManager.getUsername()
        });
    }

    async deleteShipment(id) {
        const shipments = await this.getShipments();
        const filtered = shipments.filter(s => s.id !== id);
        localStorage.setItem('axonShipments', JSON.stringify(filtered));
        this.onShipmentsUpdated();
    }

    // CLIENT METHODS
    async getClients() {
        const data = localStorage.getItem('axonClients');
        return data ? JSON.parse(data) : [];
    }

    async addClient(client) {
        client.id = 'CLT' + Date.now().toString().slice(-3);
        client.createdDate = new Date().toISOString();
        const clients = await this.getClients();
        clients.push(client);
        localStorage.setItem('axonClients', JSON.stringify(clients));
        this.onClientsUpdated();
        return client;
    }

    async deleteClient(id) {
        const clients = await this.getClients();
        const filtered = clients.filter(c => c.id !== id);
        localStorage.setItem('axonClients', JSON.stringify(filtered));
        this.onClientsUpdated();
    }

    logout() {
        authManager.logout();
    }
}

const dataManager = new DataManager();

// =============================================================================
// MAJOR CITIES & LOCATIONS DATABASE
// =============================================================================

const MAJOR_CITIES = [
    // USA
    { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.0060, label: 'New York, NY' },
    { city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.0522, lng: -118.2437, label: 'Los Angeles, CA' },
    { city: 'Chicago', state: 'IL', country: 'USA', lat: 41.8781, lng: -87.6298, label: 'Chicago, IL' },
    { city: 'Houston', state: 'TX', country: 'USA', lat: 29.7604, lng: -95.3698, label: 'Houston, TX' },
    { city: 'Phoenix', state: 'AZ', country: 'USA', lat: 33.4484, lng: -112.0742, label: 'Phoenix, AZ' },
    { city: 'Philadelphia', state: 'PA', country: 'USA', lat: 39.9526, lng: -75.1652, label: 'Philadelphia, PA' },
    { city: 'San Antonio', state: 'TX', country: 'USA', lat: 29.4241, lng: -98.4936, label: 'San Antonio, TX' },
    { city: 'San Diego', state: 'CA', country: 'USA', lat: 32.7157, lng: -117.1611, label: 'San Diego, CA' },
    { city: 'Dallas', state: 'TX', country: 'USA', lat: 32.7767, lng: -96.7970, label: 'Dallas, TX' },
    { city: 'San Jose', state: 'CA', country: 'USA', lat: 37.3382, lng: -121.8863, label: 'San Jose, CA' },
    
    // International
    { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, label: 'London, UK' },
    { city: 'Toronto', country: 'Canada', lat: 43.6629, lng: -79.3957, label: 'Toronto, Canada' },
    { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, label: 'Vancouver, Canada' },
    { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, label: 'Paris, France' },
    { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, label: 'Berlin, Germany' },
    { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, label: 'Tokyo, Japan' },
    { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, label: 'Sydney, Australia' },
    { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, label: 'Singapore' },
    { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, label: 'Dubai, UAE' }
];

const SUGGESTED_LOCATIONS = [
    { city: 'Miami', state: 'FL', country: 'USA', lat: 25.7617, lng: -80.1918, label: 'Miami, FL' },
    { city: 'Boston', state: 'MA', country: 'USA', lat: 42.3601, lng: -71.0589, label: 'Boston, MA' },
    { city: 'Denver', state: 'CO', country: 'USA', lat: 39.7392, lng: -104.9903, label: 'Denver, CO' },
    { city: 'Seattle', state: 'WA', country: 'USA', lat: 47.6062, lng: -122.3321, label: 'Seattle, WA' },
    { city: 'Austin', state: 'TX', country: 'USA', lat: 30.2672, lng: -97.7431, label: 'Austin, TX' }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 4000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'pending': 'pending', 
        'picked-up': 'in-transit', 
        'in-transit': 'in-transit',
        'out-for-delivery': 'out-for-delivery', 
        'delivered': 'delivered',
        'on-hold': 'on-hold', 
        'held-by-customs': 'customs', 
        'delay': 'warning', 
        'cancelled': 'danger'
    };
    return statusMap[status] || 'pending';
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pending', 
        'picked-up': 'Picked Up', 
        'in-transit': 'In Transit',
        'out-for-delivery': 'Out for Delivery', 
        'delivered': 'Delivered',
        'on-hold': 'On Hold', 
        'held-by-customs': 'Held by Customs', 
        'delay': 'Delayed', 
        'cancelled': 'Cancelled'
    };
    return labels[status] || status;
}

// Get all locations for autocomplete
function getAllLocationsByNames() {
    const all = [...MAJOR_CITIES, ...SUGGESTED_LOCATIONS];
    return all.map(loc => ({
        city: loc.city,
        label: loc.label,
        lat: loc.lat,
        lng: loc.lng,
        country: loc.country
    }));
}

function getLocationByName(name) {
    const all = [...MAJOR_CITIES, ...SUGGESTED_LOCATIONS];
    return all.find(loc => 
        loc.label.toLowerCase() === name.toLowerCase() || 
        loc.city.toLowerCase() === name.toLowerCase()
    );
}
