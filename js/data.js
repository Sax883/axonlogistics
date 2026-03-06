// ========================
// Data Management System (Supabase Cloud Sync)
// ========================

const SUPABASE_URL = 'https://iubsagbeugcaeybztbny.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FIJjFcUZMusW_tXzMhCsGQ_lvfMNmoF';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class DataManager {
  constructor() {
    // initializeData is kept for legacy structure but the cloud handles the storage
    this.initializeData();
  }

  initializeData() {
    // We keep this to ensure the local browser knows we are using cloud data
    if (!localStorage.getItem('axonData')) {
      localStorage.setItem('axonData', JSON.stringify({ cloudEnabled: true }));
    }
  }

  // Cloud-based data fetch
  async getShipments() {
    const { data, error } = await supabaseClient
      .from('shipments')
      .select('*')
      .order('createdDate', { ascending: false });
    
    if (error) {
      console.error('Error fetching shipments:', error);
      return [];
    }
    return data || [];
  }

  async getShipmentByTracking(trackingNumber) {
    const { data } = await supabaseClient
      .from('shipments')
      .select('*')
      .eq('trackingNumber', trackingNumber)
      .single();
    return data;
  }

  async getShipmentById(id) {
    const { data } = await supabaseClient
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }

  async addShipment(shipment) {
    // Generate IDs based on your existing pattern
    const timestamp = Date.now().toString().slice(-3);
    shipment.id = 'AXN' + timestamp;
    shipment.trackingNumber = `${shipment.id}-2026-${timestamp}`;
    
    const originLabel = shipment.origin.city + (shipment.origin.state ? ', ' + shipment.origin.state : (shipment.origin.country ? ', ' + shipment.origin.country : ''));
    
    shipment.updates = [
      { 
        date: new Date().toISOString().split('T')[0], 
        time: new Date().toTimeString().split(' ')[0], 
        status: 'pending', 
        message: 'Shipment created', 
        location: originLabel 
      }
    ];

    const { data, error } = await supabaseClient.from('shipments').insert([shipment]);
    if (error) throw error;
    return shipment;
  }

  async updateShipment(id, updates) {
    const { data, error } = await supabaseClient
      .from('shipments')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    return data;
  }

  async updateShipmentStatus(id, status, message, location) {
    // Fetch the current shipment first to get existing updates
    const shipment = await this.getShipmentById(id);
    if (!shipment) return;

    const updateEntry = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      status: status,
      message: message,
      location: location
    };

    const updatedUpdates = [...(shipment.updates || []), updateEntry];
    
    // Resolve coordinates (your original logic)
    let currentLocation = shipment.currentLocation;
    try {
      const cityName = String(location).split(',')[0].trim();
      const pool = [];
      if (typeof MAJOR_CITIES !== 'undefined') pool.push(...MAJOR_CITIES);
      if (typeof SUGGESTED_LOCATIONS !== 'undefined') pool.push(...SUGGESTED_LOCATIONS);
      
      const cityObj = pool.find(c => (c.city && c.city.toLowerCase() === cityName.toLowerCase()) || (c.label && c.label.toLowerCase() === String(location).toLowerCase()));
      
      if (cityObj) {
        const label = cityObj.label || `${cityObj.city}${cityObj.state ? ', ' + cityObj.state : ''}${cityObj.country ? ', ' + cityObj.country : ''}`;
        currentLocation = { lat: cityObj.lat, lng: cityObj.lng, label: label };
      }
    } catch (err) {
      // ignore mapping errors
    }

    return await this.updateShipment(id, { 
      status: status, 
      updates: updatedUpdates,
      currentLocation: currentLocation 
    });
  }

  async deleteShipment(id) {
    const { error } = await supabaseClient
      .from('shipments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async getClients() {
    const { data } = await supabaseClient.from('clients').select('*');
    return data || [];
  }

  async addClient(client) {
    const { data, error } = await supabaseClient.from('clients').insert([client]);
    if (error) throw error;
    return data;
  }

  async deleteClient(id) {
    await supabaseClient.from('clients').delete().eq('id', id);
  }
}

const dataManager = new DataManager();

// ========================
// Utility Functions
// ========================

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => { notification.remove(); }, 4000);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getStatusBadgeClass(status) {
  const statusMap = {
    'pending': 'pending', 'picked-up': 'in-transit', 'in-transit': 'in-transit',
    'out-for-delivery': 'out-for-delivery', 'delivered': 'delivered',
    'on-hold': 'on-hold', 'held-by-customs': 'customs', 'delay': 'warning', 'cancelled': 'danger'
  };
  return statusMap[status] || 'pending';
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Pending', 'picked-up': 'Picked Up', 'in-transit': 'In Transit',
    'out-for-delivery': 'Out for Delivery', 'delivered': 'Delivered',
    'on-hold': 'On Hold', 'held-by-customs': 'Held by Customs', 'delay': 'Delayed', 'cancelled': 'Cancelled'
  };
  return labels[status] || status;
}

// ========================
// Map Utilities & Data
// ========================

const AXON_HQ = {
  name: 'Axon Logistics Headquarters',
  lat: 44.9537, lng: -93.0900,
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
  const defaultOptions = { center: [39.8283, -98.5795], zoom: 4, scrollWheelZoom: true };
  const mapOptions = { ...defaultOptions, ...options };
  const map = L.map(elementId).setView(mapOptions.center, mapOptions.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri', maxZoom: 19 }).addTo(map);
  return map;
}

function addMarker(map, lat, lng, title, icon = 'default') {
  const iconConfig = {
    default: L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] }),
    pickup: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
    delivery: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
    waypoint: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
    headquarters: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png', iconSize: [25, 41], iconAnchor: [12, 41] })
  };
  const markerIcon = iconConfig[icon] || iconConfig['default'];
  return L.marker([lat, lng], { icon: markerIcon }).bindPopup(title).addTo(map);
}

function drawRoute(map, points) {
  if (points.length > 1) {
    L.polyline(points, { color: '#1e40af', weight: 3, opacity: 0.8, dashArray: '5, 5' }).addTo(map);
  }
}