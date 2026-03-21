# Axon Logistics - Real-Time Tracking System

## 🚀 System Overview

Axon Logistics is a professional, full-featured logistics and shipment tracking system with real-time synchronization, secure authentication, and satellite map visualization. The system includes both an admin portal and public tracking interface.

## 🔐 Security & Authentication

### Admin Portal Login
- **URL**: `admin/login.html`
- **Username**: `axon_logistic`
- **Password**: `ijoba081`

**Features:**
- Session-based authentication with 8-hour timeout
- Secure localStorage session management
- Automatic redirect to login if session expires
- Show/hide password toggle
- Professional, responsive UI
- Error handling and validation

## 🎯 Core Features

### 1. Admin Dashboard (`admin/dashboard.html`)
Comprehensive shipment management interface with real-time updates.

**Tabs:**
- **Dashboard**: Statistics and recent shipments overview
- **Shipments**: Full shipment list with search functionality
- **Clients**: Client management system
- **New Shipment**: Create new shipments with full details

**Statistics:**
- Total shipments count
- In-transit shipments count
- Delivered shipments count
- Pending shipments count

**Real-Time Features:**
- Live sync indicator showing connection status
- Cross-device synchronization
- Auto-refresh every 2 seconds
- Updates visible immediately on all connected devices

### 2. Shipment Management

**Create Shipment:**
- Sender and receiver names
- Origin and destination city selection (with autocomplete)
- Weight specification
- Estimated delivery date
- Direction input (North, South, Northeast, etc.)
- Initial status selection

**Update Shipment:**
- Change status (Pending, Picked Up, In Transit, Out for Delivery, Delivered, On Hold, Held by Customs, Delayed, Cancelled)
- Update current location
- Add update messages
- Specify direction of movement
- Full audit trail of all updates

**Statuses:**
- 🟡 **Pending** - Awaiting pickup
- 🔵 **Picked Up** - Package collected
- 🔵 **In Transit** - On the way
- 🟢 **Out for Delivery** - Final delivery phase
- ✅ **Delivered** - Shipment completed
- 🟠 **On Hold** - Temporarily stopped
- 🟣 **Held by Customs** - Customs clearance pending
- 🔴 **Delayed** - Behind schedule
- ❌ **Cancelled** - Shipment cancelled

### 3. Client Tracking (`tracking.html`)

**Public Interface Features:**
- Search by tracking number
- Real-time location updates
- Satellite map view with toggle
- Parcel location indicator
- Direction compass showing heading
- Complete shipment history timeline
- Origin and destination markers
- Route visualization with polyline

**Map Features:**
- **Standard View**: OpenStreetMap tiles
- **Satellite View**: ESRI satellite imagery
- **Markers**:
  - 🟢 Green circle = Origin
  - 📦 Package icon = Current location
  - 🔴 Red circle = Destination
- **Route**: Blue polyline showing path from origin through current location to destination

**Direction Indicators:**
- North (↑)
- Northeast (↗)
- East (→)
- Southeast (↘)
- South (↓)
- Southwest (↙)
- West (←)
- Northwest (↖)

## 🔄 Real-Time Synchronization

### How It Works

1. **Data Storage**: All shipment data stored in browser's localStorage
2. **Sync Manager**: Runs every 2 seconds to detect and broadcast changes
3. **Cross-Tab Sync**: Updates visible instantly across multiple tabs/windows
4. **Cross-Device Sync**: When a device updates a shipment, all connected devices see the change

### Sync Events

```javascript
// Automatic sync dispatches custom events:
window.dispatchEvent(new Event('shipmentsUpdated'));
window.dispatchEvent(new Event('clientsUpdated'));
```

### Testing Multi-Device Sync

1. Open admin dashboard on Device 1
2. Open admin dashboard on Device 2
3. Update a shipment on Device 1
4. Watch update appear immediately on Device 2
5. Changes persist across browser sessions and page refreshes

## 📍 Location Database

### Supported Cities

**USA:**
- New York, NY
- Los Angeles, CA
- Chicago, IL
- Houston, TX
- Phoenix, AZ
- Philadelphia, PA
- San Antonio, TX
- San Diego, CA
- Dallas, TX
- San Jose, CA
- Miami, FL
- Boston, MA
- Denver, CO
- Seattle, WA
- Austin, TX

**International:**
- London, UK
- Toronto, Canada
- Vancouver, Canada
- Paris, France
- Berlin, Germany
- Tokyo, Japan
- Sydney, Australia
- Singapore
- Dubai, UAE

All cities include precise GPS coordinates for accurate map display.

## 💾 Data Structure

### Shipment Object
```javascript
{
  id: "AXN300",                           // Unique shipment ID
  trackingNumber: "AXN300-2026-300",      // Public tracking number
  senderName: "John Doe",                 // Sender name
  receiverName: "Jane Smith",             // Receiver name
  origin: {
    city: "New York",
    label: "New York, NY",
    lat: 40.7128,
    lng: -74.0060
  },
  destination: {
    city: "Los Angeles",
    label: "Los Angeles, CA",
    lat: 34.0522,
    lng: -118.2437
  },
  currentLocation: {
    lat: 40.7128,
    lng: -74.0060,
    label: "New York, NY"
  },
  weight: "5.5 kg",
  status: "in-transit",
  direction: "West",                      // Direction of movement
  createdDate: "2026-03-21T10:30:00Z",
  estimatedDeliveryDate: "2026-03-25",
  lastUpdated: "2026-03-21T15:45:00Z",
  updatedBy: "Admin Username",
  updates: [                              // Update history
    {
      date: "2026-03-21",
      time: "10:30",
      status: "pending",
      message: "Shipment created",
      location: "New York, NY",
      direction: null
    }
  ]
}
```

### Client Object
```javascript
{
  id: "CLT123",
  name: "Acme Corp",
  email: "info@acmecorp.com",
  phone: "+1-555-0123",
  address: "123 Business Ave, New York, NY",
  createdDate: "2026-03-21T10:30:00Z"
}
```

## 🔧 Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Maps**: Leaflet.js with OpenStreetMap & ESRI Satellite
- **UI Framework**: Bootstrap 5.3.0
- **Icons**: Font Awesome 6.4.0
- **Storage**: Browser LocalStorage
- **Sync**: Custom event-based synchronization
- **Version Control**: Git

## 📁 File Structure

```
axonlogistics/
├── admin/
│   ├── login.html              # Secure login page
│   ├── dashboard.html          # Admin dashboard
│   └── admin-dashboard.js      # Admin controller
├── js/
│   ├── data-manager.js         # Core data management & sync
│   ├── data.js                 # Utility functions
│   └── tracking-client.js      # Client tracking controller
├── css/
│   └── style.css               # Global styles
├── assets/                      # Images and logos
├── index.html                  # Homepage
├── tracking.html               # Public tracking page
└── README.md                   # This file
```

## 🚀 Getting Started

### 1. Access Admin Portal
1. Navigate to `admin/login.html`
2. Enter credentials:
   - Username: `axon_logistic`
   - Password: `ijoba081`
3. Click "Sign In"

### 2. Create a Shipment
1. Go to "New Shipment" tab
2. Fill in sender and receiver info
3. Select origin and destination cities
4. Enter weight and delivery date
5. Choose direction and initial status
6. Click "Create Shipment"

### 3. Update Shipment Status
1. Go to "Dashboard" or "Shipments" tab
2. Click "Update" button on any shipment
3. Select new status and current location
4. Add update message
5. Optional: Specify direction
6. Click "Update Status"

### 4. Track Shipment (Public)
1. Navigate to `tracking.html`
2. Enter tracking number in search box
3. View real-time location on map
4. Toggle to satellite view with button
5. Check complete history timeline
6. See direction indicator

## 🌍 Multi-Device Testing

### Setup Two Devices/Windows:

**Device 1 (Admin):**
1. Open `admin/login.html`
2. Login with credentials
3. Access dashboard

**Device 2 (Admin):**
1. Open `admin/login.html`
2. Login with credentials
3. Access dashboard

**Testing:**
1. On Device 1: Update a shipment status
2. On Device 2: Status updates automatically within 2 seconds
3. No page refresh needed
4. Changes persist across all open instances

### Mobile Testing:
- Open tracking page on phone
- Enter tracking number
- View satellite map with full responsiveness
- All features work on mobile devices

## 📝 API Reference

### DataManager Methods

```javascript
// Shipment Operations
await dataManager.getShipments()
await dataManager.getShipmentByTracking(trackingNumber)
await dataManager.getShipmentById(id)
await dataManager.addShipment(shipment)
await dataManager.updateShipment(id, updates)
await dataManager.updateShipmentStatus(id, status, message, location, direction)
await dataManager.deleteShipment(id)

// Client Operations
await dataManager.getClients()
await dataManager.addClient(client)
await dataManager.deleteClient(id)

// Session
dataManager.logout()
```

### Auth Manager Methods

```javascript
authManager.isAuthenticated()      // Boolean
authManager.getUsername()           // String
authManager.redirectToLogin()       // Void
authManager.logout()                // Void
```

### Sync Manager Methods

```javascript
syncManager.subscribe(callback)     // Unsubscribe function
syncManager.generateDeviceId()      // String
```

## 🔒 Security Notes

1. **Authentication**: Session-based with localStorage
2. **Password**: Currently hardcoded (use proper backend in production)
3. **Session Timeout**: 8 hours of inactivity
4. **Data**: Stored locally - no external server
5. **Synchronization**: Based on localStorage events

**For Production:**
- Implement proper backend authentication (OAuth, JWT)
- Use HTTPS encryption
- Implement proper database (PostgreSQL, MongoDB, etc.)
- Add role-based access control (RBAC)
- Implement API authentication tokens
- Add audit logging
- Enable 2FA

## 📱 Responsive Design

- Mobile-first approach
- Fully responsive layouts
- Touch-friendly buttons and inputs
- Optimized for all screen sizes
- Map adjusts to container size

## 🎨 Styling

- Primary Color: #1e40af (Blue)
- Secondary Color: #0284c7 (Light Blue)
- Success Color: #10b981 (Green)
- Danger Color: #ef4444 (Red)
- Gradients for modern look
- Smooth transitions and animations

## 🐛 Troubleshooting

### Login Not Working
- Clear browser cache and localStorage
- Check credentials (case-sensitive)
- Ensure JavaScript is enabled

### Map Not Loading
- Check internet connection
- Verify Leaflet.js is loaded
- Check browser console for errors

### Sync Not Working
- Check if all tabs are on same domain
- Verify localStorage is enabled
- Check browser console for errors

### Tracking Number Not Found
- Verify exact tracking number format
- Check shipment was created with correct data
- Ensure origin/destination cities are in database

## 📊 Example Usage

### Creating and Tracking a Shipment

1. **Admin creates shipment:**
   ```
   From: New York, NY
   To: Los Angeles, CA
   Sender: John Doe
   Weight: 5.5 kg
   Direction: West
   Status: Pending
   ```

2. **Admin updates shipment (Device 1):**
   ```
   Status: Picked Up
   Location: New York Distribution Center
   Direction: West
   ```

3. **Shipment visible on Device 2** within 2 seconds

4. **Customer tracks on public page:**
   - Tracking Number: AXN300-2026-300
   - Sees current location in New York
   - Sees destination Los Angeles
   - Views satellite map
   - Reads update history
   - Sees direction indicator (West)

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review browser console for errors
3. Verify data format in localStorage
4. Check if all files are in correct directories

## 📄 License

Axon Logistics - © 2026. All rights reserved.

---

## Git Commit History

**Latest Commit:**
```
feat: Implement complete real-time logistics tracking system with security auth

- Professional login page with secure authentication
- Real-time synchronization across devices
- Admin dashboard with live updates
- Client tracking page with satellite map
- Direction indicators for parcels
- Cross-device shipment sync
```

---

**Version**: 1.0.0  
**Last Updated**: March 21, 2026
