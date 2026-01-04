// ========================
// Data Management System
// ========================

class DataManager {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    if (!localStorage.getItem('axonData')) {
      const defaultData = {
        shipments: [
          {
            id: 'AXN001',
            trackingNumber: 'AXN001-2025-001',
            sender: 'John Manufacturing Co.',
            receiver: 'Sarah\'s Retail Store',
            origin: { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
            destination: { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
            weight: '500 kg',
            status: 'in-transit',
            createdDate: '2025-01-02',
            estimatedDelivery: '2025-01-07',
            updates: [
              { date: '2025-01-02', time: '09:00', status: 'picked-up', message: 'Package picked up from origin', location: 'Los Angeles, CA' },
              { date: '2025-01-03', time: '14:30', status: 'in-transit', message: 'In transit to destination', location: 'Denver, CO' }
            ]
          },
          {
            id: 'AXN002',
            trackingNumber: 'AXN002-2025-002',
            sender: 'Tech Innovations Ltd.',
            receiver: 'Global Distribution Center',
            origin: { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
            destination: { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
            weight: '250 kg',
            status: 'out-for-delivery',
            createdDate: '2025-01-03',
            estimatedDelivery: '2025-01-06',
            updates: [
              { date: '2025-01-03', time: '08:15', status: 'picked-up', message: 'Package picked up', location: 'Chicago, IL' },
              { date: '2025-01-04', time: '10:45', status: 'in-transit', message: 'In transit', location: 'Nashville, TN' },
              { date: '2025-01-05', time: '16:20', status: 'out-for-delivery', message: 'Out for delivery today', location: 'Miami, FL' }
            ]
          },
          {
            id: 'AXN003',
            trackingNumber: 'AXN003-2025-003',
            sender: 'Fashion World Exporters',
            receiver: 'Premium Boutique',
            origin: { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
            destination: { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
            weight: '150 kg',
            status: 'delivered',
            createdDate: '2025-01-01',
            estimatedDelivery: '2025-01-05',
            updates: [
              { date: '2025-01-01', time: '07:30', status: 'picked-up', message: 'Package picked up', location: 'Seattle, WA' },
              { date: '2025-01-02', time: '11:00', status: 'in-transit', message: 'In transit', location: 'Billings, MT' },
              { date: '2025-01-04', time: '13:15', status: 'out-for-delivery', message: 'Out for delivery', location: 'Boston, MA' },
              { date: '2025-01-05', time: '15:45', status: 'delivered', message: 'Delivered successfully', location: 'Boston, MA' }
            ]
          }
        ],
        clients: [
          { id: 1, name: 'John Manufacturing Co.', email: 'john@manufacturing.com', phone: '+1(555)123-4567', address: 'Los Angeles, CA' },
          { id: 2, name: 'Tech Innovations Ltd.', email: 'info@techinnovations.com', phone: '+1(555)234-5678', address: 'Chicago, IL' },
          { id: 3, name: 'Fashion World Exporters', email: 'export@fashionworld.com', phone: '+1(555)345-6789', address: 'Seattle, WA' }
        ]
      };
      localStorage.setItem('axonData', JSON.stringify(defaultData));
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem('axonData'));
  }

  saveData(data) {
    localStorage.setItem('axonData', JSON.stringify(data));
  }

  getShipments() {
    return this.getData().shipments;
  }

  getShipmentByTracking(trackingNumber) {
    return this.getShipments().find(s => s.trackingNumber === trackingNumber);
  }

  getShipmentById(id) {
    return this.getShipments().find(s => s.id === id);
  }

  addShipment(shipment) {
    const data = this.getData();
    shipment.id = 'AXN' + (data.shipments.length + 1).toString().padStart(3, '0');
    shipment.trackingNumber = `${shipment.id}-2025-${String(data.shipments.length + 1).padStart(3, '0')}`;
    const originLabel = shipment.origin.city + (shipment.origin.state ? ', ' + shipment.origin.state : (shipment.origin.country ? ', ' + shipment.origin.country : ''));
    shipment.updates = [
      { date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0], status: 'pending', message: 'Shipment created', location: originLabel }
    ];
    data.shipments.push(shipment);
    this.saveData(data);
    return shipment;
  }

  updateShipment(id, updates) {
    const data = this.getData();
    const shipment = data.shipments.find(s => s.id === id);
    if (shipment) {
      Object.assign(shipment, updates);
      this.saveData(data);
    }
    return shipment;
  }

  updateShipmentStatus(id, status, message, location) {
    const data = this.getData();
    const shipment = data.shipments.find(s => s.id === id);
    if (shipment) {
      shipment.status = status;
      const updateEntry = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        status: status,
        message: message,
        location: location
      };

      // Push update
      shipment.updates.push(updateEntry);

      // Attempt to set current known coordinates for the shipment based on location string
      try {
        const cityName = String(location).split(',')[0].trim();
        // Combine local and international suggestion lists when trying to resolve coordinates
        const pool = [];
        if (typeof MAJOR_CITIES !== 'undefined') pool.push(...MAJOR_CITIES);
        if (typeof SUGGESTED_LOCATIONS !== 'undefined') pool.push(...SUGGESTED_LOCATIONS);
        const cityObj = pool.find(c => (c.city && c.city.toLowerCase() === cityName.toLowerCase()) || (c.label && c.label.toLowerCase() === String(location).toLowerCase()));
        if (cityObj) {
          const label = cityObj.label || `${cityObj.city}${cityObj.state ? ', ' + cityObj.state : ''}${cityObj.country ? ', ' + cityObj.country : ''}`;
          shipment.currentLocation = { lat: cityObj.lat, lng: cityObj.lng, label: label };
        } else if (shipment.destination && shipment.destination.city && shipment.destination.city.toLowerCase() === cityName.toLowerCase()) {
          shipment.currentLocation = { lat: shipment.destination.lat, lng: shipment.destination.lng, label: `${shipment.destination.city}, ${shipment.destination.state || ''}` };
        } else if (shipment.origin && shipment.origin.city && shipment.origin.city.toLowerCase() === cityName.toLowerCase()) {
          shipment.currentLocation = { lat: shipment.origin.lat, lng: shipment.origin.lng, label: `${shipment.origin.city}, ${shipment.origin.state || ''}` };
        }
      } catch (err) {
        // ignore mapping errors
      }

      this.saveData(data);

      // Trigger a storage key update so other windows/tabs can react (e.g., tracking map)
      try {
        localStorage.setItem('axonData_update', JSON.stringify({ id: id, ts: Date.now() }));
      } catch (e) {
        // ignore
      }
    }
    return shipment;
  }

  deleteShipment(id) {
    const data = this.getData();
    data.shipments = data.shipments.filter(s => s.id !== id);
    this.saveData(data);
  }

  getClients() {
    return this.getData().clients;
  }

  addClient(client) {
    const data = this.getData();
    client.id = Math.max(...data.clients.map(c => c.id), 0) + 1;
    data.clients.push(client);
    this.saveData(data);
    return client;
  }

  updateClient(id, updates) {
    const data = this.getData();
    const client = data.clients.find(c => c.id === id);
    if (client) {
      Object.assign(client, updates);
      this.saveData(data);
    }
    return client;
  }

  deleteClient(id) {
    const data = this.getData();
    data.clients = data.clients.filter(c => c.id !== id);
    this.saveData(data);
  }
}

// Create global instance
const dataManager = new DataManager();

// ========================
// Utility Functions
// ========================

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 4000);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

// ========================
// Map Utilities
// ========================

const AXON_HQ = {
  name: 'Axon Logistics Headquarters',
  lat: 44.9537,
  lng: -93.0900,
  address: '1234 Commerce Drive, Minneapolis, MN 55401, USA',
  whatsapp: '+1 (763) 461-4006'
};

const MAJOR_CITIES = [
  { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
  { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
  { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  { city: 'Billings', state: 'MT', lat: 45.7833, lng: -103.2495 }
];

// International suggested locations for global logistics (labels + coordinates)
const SUGGESTED_LOCATIONS = [
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, label: 'London, UK' },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, label: 'Paris, France' },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, label: 'Tokyo, Japan' },
  { city: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, label: 'Shanghai, China' },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, label: 'Singapore' },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, label: 'Dubai, UAE' },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, label: 'Sydney, Australia' },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, label: 'Toronto, Canada' },
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, label: 'Mexico City, Mexico' },
  { city: 'Sao Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, label: 'Sao Paulo, Brazil' },
  { city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, label: 'Johannesburg, South Africa' },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, label: 'Mumbai, India' },
  { city: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, label: 'Delhi, India' },
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, label: 'Istanbul, Turkey' },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, label: 'Seoul, South Korea' },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, label: 'Berlin, Germany' },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, label: 'Madrid, Spain' },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, label: 'Rome, Italy' }
];

function initializeMap(elementId, options = {}) {
  const defaultOptions = {
    center: [39.8283, -98.5795],
    zoom: 4,
    scrollWheelZoom: true
  };

  const mapOptions = { ...defaultOptions, ...options };
  const map = L.map(elementId).setView(mapOptions.center, mapOptions.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // Use Esri WorldImagery (satellite) tiles for a satellite basemap
    // Attribution follows Esri's attribution requirements
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxZoom: 19
  }).addTo(map);

  // Add satellite tiles (Esri) as the base layer (preferred)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxZoom: 19
  }).addTo(map);

  return map;
}

function addMarker(map, lat, lng, title, icon = 'default') {
  const iconConfig = {
    default: L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    }),
    pickup: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    }),
    delivery: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    }),
    waypoint: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    }),
    headquarters: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    })
  };

  const markerIcon = iconConfig[icon] || iconConfig['default'];
  return L.marker([lat, lng], { icon: markerIcon }).bindPopup(title).addTo(map);
}

function drawRoute(map, points) {
  if (points.length > 1) {
    L.polyline(points, {
      color: '#1e40af',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 5'
    }).addTo(map);
  }
}
