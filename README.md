# Axon Logistics - Professional Shipping & Logistics Website

A modern, professional logistics company website built with Bootstrap 5, featuring a client dashboard with live tracking and a comprehensive admin terminal.

## Features

### 🌐 Client Website
- **Professional Homepage**: Modern landing page with company information
- **Services Showcase**: Display all logistics services offered
- **Cargo Gallery**: Visual representation of cargo types (packages, equipment, hazardous, temperature-controlled, etc.)
- **Location Map**: Interactive map showing headquarters location in Minneapolis, USA
- **Contact Information**: 
  - Address: 1234 Commerce Drive, Minneapolis, MN 55401
  - Phone: +1 (763) 461-4006
  - WhatsApp Integration: Direct messaging with WhatsApp

### 📍 Live Tracking System
- **Real-time Tracking Map**: Interactive Leaflet map showing shipment route
- **Status Updates**: Complete shipment history with timestamps and locations
- **Visual Timeline**: Clear visual representation of shipment journey
- **Progress Bar**: Visual progress indicator from pickup to delivery
- **Multiple Status States**:
  - Pending
  - Picked Up
  - In Transit
  - Out for Delivery
  - Delivered
  - On Hold
  - Held by Customs
  - Delayed
  - Cancelled

### 🔧 Admin Dashboard
- **Dashboard Overview**: Statistics for total shipments, in-transit, delivered, and on-hold
- **Shipment Management**:
  - View all shipments with detailed information
  - Create new shipments with automatic tracking number generation
  - Update shipment status and add location updates
  - Delete shipments
  - Filter and search shipments

- **Client Management**:
  - Add new clients
  - Edit client information
  - Delete clients
  - Maintain client database

- **Status Management**: Professional status options for tracking:
  - Standard shipping statuses
  - Custom holding states (Customs, Delays)
  - Complete shipment lifecycle management

### 🎨 Design & Branding
- **Professional Logo**: Custom SVG logo with Axon Logistics branding
- **Responsive Bootstrap 5**: Mobile-friendly design across all devices
- **Modern Color Scheme**: Professional blue gradient (#1e40af to #0284c7)
- **Icon Integration**: Font Awesome icons throughout the application
- **Professional Styling**: Card-based layouts with smooth animations

## Project Structure

```
axonlogistics/
├── index.html                 # Main homepage
├── tracking.html              # Shipment tracking page
├── css/
│   └── style.css             # Custom styling
├── js/
│   └── data.js               # Data management system
├── admin/
│   └── dashboard.html         # Admin dashboard
└── assets/
    └── logo.svg              # Axon Logistics logo
```

## Technologies Used

- **Frontend**: HTML5, CSS3, Bootstrap 5
- **Mapping**: Leaflet.js (OpenStreetMap)
- **Icons**: Font Awesome
- **Data Storage**: LocalStorage (JSON)
- **JavaScript**: Vanilla JS (No dependencies required)

## Getting Started

### 1. Open the Website
1. Navigate to the project folder
2. Open `index.html` in a web browser
3. The website will load with the landing page

### 2. Key URLs
- **Homepage**: `index.html`
- **Tracking Page**: `tracking.html`
- **Admin Dashboard**: `admin/dashboard.html`

### 3. Sample Tracking Numbers
Use these to test the tracking functionality:
- `AXN001-2025-001` - In Transit (Los Angeles to New York)
- `AXN002-2025-002` - Out for Delivery (Chicago to Miami)
- `AXN003-2025-003` - Delivered (Seattle to Boston)

## Features in Detail

### Admin Dashboard Usage

#### Creating a New Shipment
1. Go to Admin Dashboard → New Shipment tab
2. Fill in sender and receiver information
3. Select origin and destination cities
4. Enter weight and estimated delivery date
5. Set initial status
6. Click "Create Shipment"

#### Updating Shipment Status
1. Go to Shipments tab
2. Click the Edit button (pencil icon) on a shipment
3. Select new status
4. Add update message
5. Select current location
6. Click "Update"

#### Managing Clients
1. Go to Clients tab
2. Click "Add Client" to create new client
3. Edit existing client information
4. Delete clients as needed

### Client Tracking

1. Visit `tracking.html`
2. Enter a valid tracking number
3. View:
   - Shipment details (sender, receiver, weight, etc.)
   - Live map with route visualization
   - Complete status timeline
   - Journey progress bar

## Data Management

All data is stored locally in the browser using LocalStorage. The system includes:
- **Shipment Database**: Complete shipment records with tracking history
- **Client Database**: Client information and contact details
- **Update Tracking**: Timestamps, locations, and status changes for each shipment

### Sample Data
The system comes pre-loaded with 3 sample shipments:
1. AXN001 - Manufacturing goods from LA to NY
2. AXN002 - Tech equipment from Chicago to Miami
3. AXN003 - Fashion items from Seattle to Boston

## Company Information

**Axon Logistics**
- **Headquarters**: 1234 Commerce Drive, Minneapolis, MN 55401, USA
- **Phone**: +1 (763) 461-4006
- **WhatsApp**: +1 (763) 461-4006
- **Services**: Global shipping, ground transport, ocean freight, air cargo, cargo management, live tracking

## Map Integration

The website uses **OpenStreetMap** with **Leaflet.js** for:
- Headquarters location display
- Real-time shipment tracking routes
- Interactive maps with zoom and pan capabilities
- Custom markers for pickup, delivery, and waypoints

## Contact & Support

The website provides multiple contact channels:
- **Phone**: +1 (763) 461-4006
- **WhatsApp**: Direct messaging link
- **Address**: Displayed on map and in footer
- **24/7 Support**: Advertised in services section

## Customization

### Changing Company Information
Edit the `AXON_HQ` object in `js/data.js`:
```javascript
const AXON_HQ = {
  name: 'Axon Logistics Headquarters',
  lat: 44.9537,
  lng: -93.0900,
  address: '1234 Commerce Drive, Minneapolis, MN 55401, USA',
  whatsapp: '+1 (763) 461-4006'
};
```

### Adding More Cities
Add cities to the `MAJOR_CITIES` array in `js/data.js` for tracking routes.

### Customizing Colors
Edit CSS variables in `css/style.css`:
```css
:root {
  --primary-color: #1e40af;
  --secondary-color: #0284c7;
  /* ... other colors ... */
}
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Professional logistics website built for Axon Logistics. All rights reserved.

---

**Ready to use!** Open `index.html` in your browser to get started.
