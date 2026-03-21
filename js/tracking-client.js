// ===========================================================
// CLIENT TRACKING PAGE CONTROLLER
// ===========================================================

let trackingMap = null;
let currentMarkers = { origin: null, destination: null, current: null };
let currentPolyline = null;
let isSatelliteView = false;
let currentShipment = null;

// Initialize map on page load
document.addEventListener('DOMContentLoaded', async function() {
    initializeMap();
    setupEventListeners();
    
    // Listen for real-time updates
    syncManager.subscribe((type) => {
        if (type === 'axonShipments' && currentShipment) {
            // Refresh current shipment if it's updated
            searchTrackingInternal(currentShipment.trackingNumber);
        }
    });
});

function initializeMap() {
    trackingMap = L.map('trackingMap').setView([20, 0], 2);
    
    // Default to OSM (will switch to satellite)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });
    osmLayer.addTo(trackingMap);
    
    // Store satellite layer for switching
    trackingMap.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 18
    });
    
    trackingMap.osmLayer = osmLayer;
    
    // Toggle satellite view
    document.getElementById('satelliteToggle').addEventListener('click', toggleSatelliteView);
}

function toggleSatelliteView() {
    isSatelliteView = !isSatelliteView;
    const btn = document.getElementById('satelliteToggle');
    
    if (isSatelliteView) {
        trackingMap.removeLayer(trackingMap.osmLayer);
        trackingMap.addLayer(trackingMap.satelliteLayer);
        btn.style.background = 'var(--primary-color)';
        btn.style.color = 'white';
        btn.innerHTML = '<i class="fas fa-satellite"></i> Map View';
    } else {
        trackingMap.removeLayer(trackingMap.satelliteLayer);
        trackingMap.addLayer(trackingMap.osmLayer);
        btn.style.background = 'white';
        btn.style.color = 'var(--secondary-color)';
        btn.innerHTML = '<i class="fas fa-satellite"></i> Satellite';
    }
}

function setupEventListeners() {
    document.getElementById('trackingInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchTracking();
    });
}

async function searchTracking() {
    const trackingNumber = document.getElementById('trackingInput').value.trim().toUpperCase();
    
    if (!trackingNumber) {
        showNotification('Please enter a tracking number', 'error');
        return;
    }
    
    await searchTrackingInternal(trackingNumber);
}

async function searchTrackingInternal(trackingNumber) {
    try {
        const shipment = await dataManager.getShipmentByTracking(trackingNumber);
        
        if (!shipment) {
            document.getElementById('trackingResult').style.display = 'none';
            document.getElementById('noResult').style.display = 'block';
            document.getElementById('noResultMessage').textContent = `No shipment found with tracking number: ${trackingNumber}`;
            return;
        }
        
        currentShipment = shipment;
        displayShipmentInfo(shipment);
        displayMap(shipment);
        displayTimeline(shipment);
        
        document.getElementById('trackingResult').style.display = 'block';
        document.getElementById('noResult').style.display = 'none';
        
    } catch (error) {
        console.error('Error searching tracking:', error);
        showNotification('Error tracking shipment', 'error');
    }
}

function displayShipmentInfo(shipment) {
    document.getElementById('trackingNumber').textContent = shipment.trackingNumber || 'N/A';
    document.getElementById('origin').textContent = shipment.origin?.label || shipment.origin?.city || 'N/A';
    document.getElementById('destination').textContent = shipment.destination?.label || shipment.destination?.city || 'N/A';
    document.getElementById('senderName').textContent = shipment.senderName || 'N/A';
    
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = getStatusLabel(shipment.status);
    statusBadge.style.background = getStatusColor(shipment.status);
    
    // Display current location
    document.getElementById('currentLocation').textContent = 
        (shipment.currentLocation?.label || shipment.origin?.label || 'Loading...');
    
    // Display direction
    displayDirection(shipment.direction || shipment.destinationLocation?.direction);
}

function displayDirection(direction) {
    const directionText = document.getElementById('directionText');
    const compass = document.getElementById('compassDirection');
    
    const directionMap = {
        'north': { emoji: '↑', abbr: 'N', text: 'North' },
        'northeast': { emoji: '↗', abbr: 'NE', text: 'Northeast' },
        'east': { emoji: '→', abbr: 'E', text: 'East' },
        'southeast': { emoji: '↘', abbr: 'SE', text: 'Southeast' },
        'south': { emoji: '↓', abbr: 'S', text: 'South' },
        'southwest': { emoji: '↙', abbr: 'SW', text: 'Southwest' },
        'west': { emoji: '←', abbr: 'W', text: 'West' },
        'northwest': { emoji: '↖', abbr: 'NW', text: 'Northwest' }
    };
    
    const normalizedDirection = (direction || 'north').toLowerCase();
    const dirInfo = directionMap[normalizedDirection] || directionMap['north'];
    
    directionText.textContent = dirInfo.text;
    compass.innerHTML = `<span style="font-size: 2rem;">${dirInfo.emoji}</span><br><span style="font-size: 0.7rem;">${dirInfo.abbr}</span>`;
}

function displayMap(shipment) {
    // Clear previous markers and polyline
    if (currentMarkers.origin) trackingMap.removeLayer(currentMarkers.origin);
    if (currentMarkers.destination) trackingMap.removeLayer(currentMarkers.destination);
    if (currentMarkers.current) trackingMap.removeLayer(currentMarkers.current);
    if (currentPolyline) trackingMap.removeLayer(currentPolyline);
    
    const originLat = shipment.origin?.lat;
    const originLng = shipment.origin?.lng;
    const destLat = shipment.destination?.lat;
    const destLng = shipment.destination?.lng;
    const currentLat = shipment.currentLocation?.lat || originLat;
    const currentLng = shipment.currentLocation?.lng || originLng;
    
    if (!originLat || !originLng || !destLat || !destLng) {
        console.warn('Missing coordinates for mapping');
        return;
    }
    
    // Origin marker
    currentMarkers.origin = L.circleMarker([originLat, originLng], {
        radius: 10,
        fillColor: '#10b981',
        color: 'white',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(trackingMap).bindPopup('<strong>Origin</strong><br>' + (shipment.origin?.label || 'N/A'));
    
    // Destination marker
    currentMarkers.destination = L.circleMarker([destLat, destLng], {
        radius: 10,
        fillColor: '#ef4444',
        color: 'white',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(trackingMap).bindPopup('<strong>Destination</strong><br>' + (shipment.destination?.label || 'N/A'));
    
    // Current location marker (parcel)
    const parcelIcon = L.divIcon({
        html: `<div style="background: linear-gradient(135deg, #1e40af 0%, #0284c7 100%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border: 3px solid white;">📦</div>`,
        iconSize: [40, 40],
        className: 'parcel-icon'
    });
    
    currentMarkers.current = L.marker([currentLat || originLat, currentLng || originLng], {
        icon: parcelIcon
    }).addTo(trackingMap).bindPopup(`<strong>Current Location</strong><br>${shipment.currentLocation?.label || shipment.origin?.label || 'In Transit'}`);
    
    // Draw polyline from origin to destination through current location
    if (originLat && originLng && destLat && destLng && currentLat && currentLng) {
        currentPolyline = L.polyline(
            [[originLat, originLng], [currentLat, currentLng], [destLat, destLng]],
            { color: '#0284c7', weight: 3, opacity: 0.7 }
        ).addTo(trackingMap);
    }
    
    // Fit map to bounds
    const group = new L.featureGroup([currentMarkers.origin, currentMarkers.destination]);
    trackingMap.fitBounds(group.getBounds(), { padding: [50, 50] });
}

function displayTimeline(shipment) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    const updates = shipment.updates || [];
    const totalUpdates = updates.length;
    
    updates.forEach((update, index) => {
        const isCompleted = index < totalUpdates - 1 || shipment.status === 'delivered';
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        item.innerHTML = `
            <div class="timeline-dot ${isCompleted ? 'completed' : ''}"></div>
            <div class="timeline-content">
                <div class="timeline-time">${update.date} at ${update.time}</div>
                <div class="timeline-status">${getStatusLabel(update.status)}</div>
                <div style="color: #6b7280;">${update.message}</div>
                <div style="font-size: 0.85rem; color: #9ca3af; margin-top: 5px;">
                    <i class="fas fa-map-marker"></i> ${update.location}
                    ${update.direction ? ` • Direction: <strong>${update.direction}</strong>` : ''}
                </div>
            </div>
        `;
        
        timeline.appendChild(item);
    });
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

function getStatusColor(status) {
    const colors = {
        'pending': '#fef3c7',
        'picked-up': '#bfdbfe',
        'in-transit': '#bfdbfe',
        'out-for-delivery': '#d1fae5',
        'delivered': '#dcfce7',
        'on-hold': '#fed7aa',
        'held-by-customs': '#fbcfe8',
        'delay': '#fecaca',
        'cancelled': '#fca5a5'
    };
    return colors[status] || '#fef3c7';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 4000);
}
