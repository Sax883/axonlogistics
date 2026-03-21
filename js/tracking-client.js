// ===========================================================
// CLIENT TRACKING PAGE CONTROLLER
// ===========================================================

// Global variables
let trackingMap = null;
let currentMarkers = { origin: null, destination: null, current: null };
let currentPolyline = null;
let isSatelliteView = false;
let currentShipment = null;


// Create sample shipments for testing if none exist
async function initializeSampleShipments() {
    const shipments = await dataManager.getShipments();
    if (shipments.length === 0) {
        console.log('Creating sample shipments...'); // Debug
        
        // Sample shipment 1: New York to Los Angeles
        await dataManager.addShipment({
            senderName: 'John Electronics Store',
            receiverName: 'Sarah Mitchell',
            senderContact: '+1-212-555-0123',
            receiverContact: '+1-310-555-0456',
            origin: { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.0060, label: 'New York, NY' },
            destination: { city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.0522, lng: -118.2437, label: 'Los Angeles, CA' },
            currentLocation: { city: 'Denver', state: 'CO', country: 'USA', lat: 39.7392, lng: -104.9903, label: 'Denver, CO' },
            weight: '5.2 kg',
            description: 'Premium Electronics Package',
            contents: 'Laptop, USB cables, power adapter',
            status: 'in-transit',
            direction: 'west',
            daysToDeliver: 5
        });
        
        // Sample shipment 2: Toronto to Miami
        await dataManager.addShipment({
            senderName: 'Global Tech Supplies',
            receiverName: 'Roberto Garcia',
            senderContact: '+1-416-555-0789',
            receiverContact: '+1-305-555-0321',
            origin: { city: 'Toronto', country: 'Canada', lat: 43.6629, lng: -79.3957, label: 'Toronto, Canada' },
            destination: { city: 'Miami', state: 'FL', country: 'USA', lat: 25.7617, lng: -80.1918, label: 'Miami, FL' },
            currentLocation: { city: 'Atlanta', state: 'GA', country: 'USA', lat: 33.7490, lng: -84.3880, label: 'Atlanta, GA' },
            weight: '3.8 kg',
            description: 'Business Equipment',
            contents: 'Keyboard, mouse, monitor',
            status: 'in-transit',
            direction: 'south',
            daysToDeliver: 3
        });
        
        // Sample shipment 3: London to Dubai
        await dataManager.addShipment({
            senderName: 'UK Fashion Exports Ltd',
            receiverName: 'Ahmed Al-Mansouri',
            senderContact: '+44-20-7555-0111',
            receiverContact: '+971-4-555-0222',
            origin: { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, label: 'London, UK' },
            destination: { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, label: 'Dubai, UAE' },
            currentLocation: { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, label: 'Istanbul, Turkey' },
            weight: '8.5 kg',
            description: 'Luxury Fashion Collection',
            contents: 'Designer clothing and accessories',
            status: 'in-transit',
            direction: 'east',
            daysToDeliver: 7
        });
        
        console.log('Sample shipments created successfully'); // Debug
    }
}

// Initialize map on page load
document.addEventListener('DOMContentLoaded', async function() {
    await initializeSampleShipments();
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
    // Start with world view
    trackingMap = L.map('trackingMap').setView([20, 0], 2);
    
    // High-quality OpenStreetMap layer
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'osm-tile'
    });
    osmLayer.addTo(trackingMap);
    
    // High-resolution satellite imagery from Esri (shows houses, cars, streets)
    trackingMap.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, DigitalGlobe, Earthstar Geographics',
        maxZoom: 20
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
    
    // Add click handler for sample tracking display
    const sampleTrackingSpan = document.getElementById('sampleTracking');
    if (sampleTrackingSpan) {
        sampleTrackingSpan.style.cursor = 'pointer';
        sampleTrackingSpan.addEventListener('click', showSampleShipments);
    }
    
    // Handle window resize for responsive map
    window.addEventListener('resize', () => {
        if (trackingMap) {
            trackingMap.invalidateSize();
        }
    });
}

async function showSampleShipments() {
    const shipments = await dataManager.getShipments();
    console.log('Available shipments:', shipments); // Debug log
    
    if (shipments.length > 0) {
        const sampleList = shipments.slice(0, 3).map(s => `${s.id} (${s.trackingNumber})`).join(' | ');
        const tracking = shipments.map(s => s.trackingNumber).slice(0, 3).join(', ');
        
        // Update placeholder to show actual sample numbers
        document.getElementById('trackingInput').placeholder = `Try: ${tracking}`;
        showNotification(`✓ Sample IDs/Tracking: ${sampleList}`, 'success');
        
        // Also auto-load first shipment
        const trackingInput = document.getElementById('trackingInput');
        trackingInput.value = shipments[0].trackingNumber;
        await searchTracking();
    } else {
        showNotification('No shipments available. Creating sample data...', 'warning');
        await initializeSampleShipments();
        await showSampleShipments(); // Retry
    }
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
        console.log('Searching for:', trackingNumber); // Debug
        const shipment = await dataManager.getShipmentByTracking(trackingNumber);
        console.log('Found shipment:', shipment); // Debug
        
        if (!shipment) {
            // Show all available shipments for debugging
            const allShipments = await dataManager.getShipments();
            const availableIds = allShipments.map(s => `${s.id} (${s.trackingNumber})`).join(', ');
            
            document.getElementById('trackingResult').style.display = 'none';
            document.getElementById('noResult').style.display = 'block';
            document.getElementById('noResultMessage').textContent = 
                `Shipment "${trackingNumber}" not found.\n\nAvailable: ${availableIds || 'No shipments found'}`;
            showNotification('Shipment not found. Check available IDs and try again.', 'warning');
            return;
        }
        
        currentShipment = shipment;
        displayShipmentInfo(shipment);
        displayMap(shipment);
        displayTimeline(shipment);
        
        document.getElementById('trackingResult').style.display = 'block';
        document.getElementById('noResult').style.display = 'none';
        showNotification(`✓ Shipment ${shipment.trackingNumber} loaded!`, 'success');
        
    } catch (error) {
        console.error('Error searching tracking:', error);
        document.getElementById('trackingResult').style.display = 'none';
        document.getElementById('noResult').style.display = 'block';
        document.getElementById('noResultMessage').textContent = `Error: ${error.message}`;
        showNotification('Error loading shipment. Check browser console.', 'error');
    }
}

function displayShipmentInfo(shipment) {
    // Tracking Info
    document.getElementById('trackingNumber').textContent = shipment.trackingNumber || 'N/A';
    document.getElementById('parcelTrackingNumber').textContent = shipment.trackingNumber || 'N/A';
    
    // Parcel Details
    document.getElementById('parcelWeight').textContent = shipment.weight || 'N/A';
    document.getElementById('parcelDescription').textContent = shipment.description || shipment.contents || 'Not specified';
    document.getElementById('parcelShippedDate').textContent = shipment.shippedDate || 'N/A';
    document.getElementById('parcelExpectedDelivery').textContent = shipment.expectedDelivery || 'N/A';
    
    // CALCULATE JOURNEY PROGRESS
    const originLat = shipment.origin?.lat;
    const originLng = shipment.origin?.lng;
    const destLat = shipment.destination?.lat;
    const destLng = shipment.destination?.lng;
    let journeyProgress = 0;
    
    if (originLat && originLng && destLat && destLng) {
        let currentLat = shipment.currentLocation?.latitude || shipment.currentLocation?.lat;
        let currentLng = shipment.currentLocation?.longitude || shipment.currentLocation?.lng;
        
        if (currentLat && currentLng) {
            const totalDist = Math.sqrt(Math.pow(destLat - originLat, 2) + Math.pow(destLng - originLng, 2));
            const currentDist = Math.sqrt(Math.pow(currentLat - originLat, 2) + Math.pow(currentLng - originLng, 2));
            journeyProgress = Math.min((currentDist / totalDist) * 100, 95); // Cap at 95%
        }
    }
    
    // Current Location Info
    document.getElementById('currentLocation').textContent = 
        (shipment.currentLocation?.label || shipment.currentLocation?.city || shipment.origin?.label || 'In Transit');
    
    // Display Journey Progress (optional - can remove if not needed)
    const progressElement = document.getElementById('journeyProgress');
    if (progressElement) {
        progressElement.textContent = Math.round(journeyProgress);
    }
    
    document.getElementById('destination').textContent = 
        (shipment.destination?.label || shipment.destination?.city || 'N/A');
    
    // Sender Information
    document.getElementById('senderName').textContent = shipment.senderName || 'N/A';
    document.getElementById('senderLocation').textContent = 
        (shipment.origin?.label || shipment.origin?.city || 'N/A');
    document.getElementById('senderContact').textContent = shipment.senderContact || 'Not provided';
    
    // Receiver Information
    document.getElementById('receiverName').textContent = shipment.receiverName || 'N/A';
    document.getElementById('receiverLocation').textContent = 
        (shipment.destination?.label || shipment.destination?.city || 'N/A');
    document.getElementById('receiverContact').textContent = shipment.receiverContact || 'Not provided';
    
    // Status Badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = getStatusLabel(shipment.status);
    statusBadge.style.background = getStatusColor(shipment.status);
    
    // Display direction
    displayDirection(shipment.direction || shipment.destinationLocation?.direction);
}

function displayDirection(direction) {
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
    
    compass.innerHTML = `
        <div style="font-size: 2.5rem; margin-bottom: 8px; animation: rotate 10s linear infinite;">
            ${dirInfo.emoji}
        </div>
        <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary-color);">
            ${dirInfo.abbr}
        </div>
        <div style="font-size: 0.75rem; color: #6b7280; margin-top: 4px;">
            Heading ${dirInfo.text}
        </div>
        <style>
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        </style>
    `;
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
    
    if (!originLat || !originLng || !destLat || !destLng) {
        console.warn('Missing coordinates for mapping');
        return;
    }
    
    // CALCULATE JOURNEY PROGRESS (for display only)
    let journeyProgress = 0;
    
    if (shipment.currentLocation?.latitude || shipment.currentLocation?.lat) {
        const currentLat = shipment.currentLocation.latitude || shipment.currentLocation.lat;
        const currentLng = shipment.currentLocation.longitude || shipment.currentLocation.lng;
        
        const totalDist = Math.sqrt(Math.pow(destLat - originLat, 2) + Math.pow(destLng - originLng, 2));
        const currentDist = Math.sqrt(Math.pow(currentLat - originLat, 2) + Math.pow(currentLng - originLng, 2));
        journeyProgress = Math.min((currentDist / totalDist) * 100, 95); // Cap at 95%
    }
    
    if (!originLat || !originLng || !destLat || !destLng) {
        console.warn('Missing coordinates for mapping');
        return;
    }
    
    // AUTO-SWITCH TO SATELLITE VIEW to show real imagery (houses, roads, cars)
    if (!isSatelliteView) {
        trackingMap.removeLayer(trackingMap.osmLayer);
        trackingMap.addLayer(trackingMap.satelliteLayer);
        isSatelliteView = true;
        document.getElementById('satelliteToggle').style.background = 'var(--primary-color)';
        document.getElementById('satelliteToggle').style.color = 'white';
        document.getElementById('satelliteToggle').innerHTML = '<i class="fas fa-satellite"></i> Map View';
    }
    
    // Origin marker (Sender location) - GREEN CIRCLE
    currentMarkers.origin = L.circleMarker([originLat, originLng], {
        radius: 16,
        fillColor: '#22c55e',
        color: 'white',
        weight: 4,
        opacity: 1,
        fillOpacity: 0.95
    }).addTo(trackingMap).bindPopup(
        `<div style="font-weight: 700; color: #22c55e; font-size: 1.05rem;">
            <i class="fas fa-location-dot"></i> SENDER LOCATION
        </div>
        <strong style="display: block; margin: 8px 0; font-size: 0.95rem;">${shipment.senderName || 'Sender'}</strong>
        <small style="display: block; color: #666; margin: 4px 0;">${shipment.origin?.label || 'N/A'}</small>
        <small style="display: block; color: #666;">${shipment.senderContact || 'N/A'}</small>`
    );
    
    // Destination marker (Receiver location) - RED CIRCLE
    currentMarkers.destination = L.circleMarker([destLat, destLng], {
        radius: 16,
        fillColor: '#ef4444',
        color: 'white',
        weight: 4,
        opacity: 1,
        fillOpacity: 0.95
    }).addTo(trackingMap).bindPopup(
        `<div style="font-weight: 700; color: #ef4444; font-size: 1.05rem;">
            <i class="fas fa-map-pin"></i> RECEIVER LOCATION
        </div>
        <strong style="display: block; margin: 8px 0; font-size: 0.95rem;">${shipment.receiverName || 'Receiver'}</strong>
        <small style="display: block; color: #666; margin: 4px 0;">${shipment.destination?.label || 'N/A'}</small>
        <small style="display: block; color: #666;">${shipment.receiverContact || 'N/A'}</small>`
    );
    
    // CURRENT LOCATION MARKER - CAR (🚗) with pulsing effect
    const currentLocationLat = shipment.currentLocation?.latitude || shipment.currentLocation?.lat;
    const currentLocationLng = shipment.currentLocation?.longitude || shipment.currentLocation?.lng;
    
    if (currentLocationLat && currentLocationLng) {
        const carIcon = L.divIcon({
            html: `<div style="
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            ">
                <div style="
                    background: linear-gradient(135deg, #ff8c00 0%, #ffa500 100%);
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    box-shadow: 0 0 0 4px white, 0 0 0 6px #ff8c00, 0 8px 25px rgba(255, 140, 0, 0.7);
                    border: 2px solid white;
                    animation: carPulse 1.8s ease-in-out infinite;
                ">
                    🚗
                </div>
                <div style="
                    width: 0;
                    height: 0;
                    border-left: 12px solid transparent;
                    border-right: 12px solid transparent;
                    border-top: 14px solid #ff8c00;
                    filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));
                    margin-top: -2px;
                    z-index: 999;
                "></div>
            </div>
            <style>
                @keyframes carPulse {
                    0%, 100% {
                        box-shadow: 0 0 0 4px white, 0 0 0 6px #ff8c00, 0 8px 25px rgba(255, 140, 0, 0.7);
                        transform: scale(1);
                    }
                    50% {
                        box-shadow: 0 0 0 4px white, 0 0 0 10px rgba(255, 140, 0, 0.8), 0 12px 35px rgba(255, 140, 0, 0.8);
                        transform: scale(1.1);
                    }
                }
            </style>`,
            iconSize: [60, 80],
            iconAnchor: [30, 80],
            className: 'car-marker',
            popupAnchor: [0, -80]
        });
        
        currentMarkers.current = L.marker([currentLocationLat, currentLocationLng], {
            icon: carIcon,
            zIndexOffset: 10000
        }).addTo(trackingMap).bindPopup(
            `<div style="font-weight: 700; color: #ff8c00; font-size: 1.05rem;">
                <i class="fas fa-car"></i> PARCEL IN TRANSIT
            </div>
            <strong style="display: block; margin: 8px 0; font-size: 0.95rem;">${shipment.currentLocation?.label || 'In Transit'}</strong>
            <small style="display: block; color: #666; margin: 4px 0;">Status: <strong>${getStatusLabel(shipment.status)}</strong></small>
            <small style="display: block; color: #666;">Journey Progress: <strong>${Math.round(journeyProgress)}%</strong></small>
            <small style="display: block; color: #666;">Heading to: <strong>${shipment.destination?.label || 'Destination'}</strong></small>`
        );
    }
    
    // Draw COLORED route lines showing the journey
    if (originLat && originLng && destLat && destLng) {
        const currentLocationLat = shipment.currentLocation?.latitude || shipment.currentLocation?.lat;
        const currentLocationLng = shipment.currentLocation?.longitude || shipment.currentLocation?.lng;
        
        // If current location exists, show progress (Orange = completed, Green = remaining)
        if (currentLocationLat && currentLocationLng) {
            // COMPLETED PATH - ORANGE line (origin to current location)
            const completedPath = L.polyline(
                [[originLat, originLng], [currentLocationLat, currentLocationLng]],
                { 
                    color: '#ff8c00',  // Bright orange - completed journey
                    weight: 6,
                    opacity: 1,
                    dashArray: undefined,
                    lineCap: 'round',
                    lineJoin: 'round'
                }
            ).addTo(trackingMap);
            
            // REMAINING PATH - GREEN line (current location to destination)
            const remainingPath = L.polyline(
                [[currentLocationLat, currentLocationLng], [destLat, destLng]],
                { 
                    color: '#22c55e',  // Bright green - remaining journey
                    weight: 6,
                    opacity: 0.9,
                    dashArray: '15, 8',
                    lineCap: 'round',
                    lineJoin: 'round',
                    className: 'destination-route'
                }
            ).addTo(trackingMap);
            
            currentPolyline = completedPath;
        } else {
            // FULL ROUTE - ORANGE line (if no current location specified)
            const routePath = L.polyline(
                [[originLat, originLng], [destLat, destLng]],
                { 
                    color: '#ff8c00',  // Bright orange
                    weight: 6,
                    opacity: 0.8,
                    dashArray: undefined,
                    lineCap: 'round',
                    lineJoin: 'round'
                }
            ).addTo(trackingMap);
            
            currentPolyline = routePath;
        }
    }
    
    // AUTO-ZOOM to show the entire route clearly including current location
    // Zoom level that shows full route while maintaining detail
    const screenWidth = window.innerWidth;
    
    // Fit map to show origin, destination, and current location
    try {
        setTimeout(() => {
            const markersToFit = [currentMarkers.origin, currentMarkers.destination];
            if (currentMarkers.current) {
                markersToFit.push(currentMarkers.current);
            }
            
            const group = new L.featureGroup(markersToFit);
            const bounds = group.getBounds();
            
            if (bounds.isValid()) {
                // Padding for bounds fitting
                const padding = screenWidth < 480 ? [50, 50] : screenWidth < 768 ? [60, 60] : [80, 80];
                // Max zoom prevents zooming in too close on fitBounds
                const maxZoom = screenWidth < 768 ? 15 : 16;
                trackingMap.fitBounds(bounds, { padding: padding, maxZoom: maxZoom, animate: true });
            }
        }, 300);
    } catch (mapError) {
        console.warn('Map fitting error (non-critical):', mapError);
    }
    
    // Trigger map resize to ensure proper rendering
    setTimeout(() => {
        trackingMap.invalidateSize();
    }, 100);
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
