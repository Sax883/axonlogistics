# Axon Logistics - Complete Setup & Usage Guide

## 🚀 Getting Started

### Step 1: Open the Website
Simply open **START.html** in your web browser for the welcome page with quick links.

### Step 2: Navigate to the Sections

#### **Homepage** (index.html)
- View company information
- See services offered
- Browse cargo types
- View headquarters location on interactive map
- Contact information with WhatsApp link

#### **Tracking Page** (tracking.html)
- Enter tracking number to view shipment details
- See live map with shipment route
- View complete status updates timeline
- Monitor shipment progress

#### **Admin Dashboard** (admin/dashboard.html)
- Manage all shipments
- Create new shipments
- Update shipment statuses
- Manage clients database
- View statistics and overview

---

## 📊 Admin Dashboard Features

### Dashboard Tab
- **Statistics**: Total shipments, in transit, delivered, on hold
- **Recent Shipments**: Last 5 shipments with quick actions
- **Quick Actions**: Edit status, view details, delete shipments

### Shipments Tab
- **View All Shipments**: Complete list with all details
- **Search/Filter**: Find shipments by tracking number
- **Edit Status**: Update shipment progress and location
- **Delete**: Remove shipments from system
- **Actions Available**:
  - Edit (Update status and location)
  - View (See detailed information)
  - Delete (Remove from database)

### Clients Tab
- **Manage Clients**: View all client information
- **Add Client**: Create new client records
- **Edit Client**: Update client details
- **Delete Client**: Remove client records

### New Shipment Tab
- **Create Shipments**: Complete form to create new shipments
- **Auto-tracking**: System generates unique tracking number
- **Set Status**: Initial shipment status
- **City Selection**: Choose from major US cities

---

## 🎯 How to Update Shipment Status

### In Admin Dashboard:
1. Go to **Shipments** tab
2. Click the **Edit button** (pencil icon) on any shipment
3. Modal will open showing:
   - Current tracking number
   - Current status
   - New status dropdown
   - Update message field
   - Location dropdown

4. **Fill in**:
   - **New Status**: Select from available options
   - **Update Message**: Describe what happened (e.g., "Arrived at distribution center")
   - **Current Location**: Select city where package currently is

5. Click **"Update"** button
6. Confirmation notification appears
7. Data updates in real-time

### Available Status Options:
- ✋ **Pending** - Shipment created, awaiting pickup
- 📦 **Picked Up** - Package picked from sender
- 🚚 **In Transit** - On the way to destination
- 🏠 **Out for Delivery** - On delivery vehicle
- ✅ **Delivered** - Successfully delivered
- 🛑 **On Hold** - Waiting for customer action
- 🚫 **Held by Customs** - Customs clearance pending
- ⏰ **Delayed** - Experiencing delays
- ❌ **Cancelled** - Shipment cancelled

---

## 📍 How to Create New Shipment

### Steps:
1. Open Admin Dashboard
2. Click **"New Shipment"** tab
3. Fill out the form:

   **Sender Information**:
   - Sender Name: Company or person name
   - Origin City: Select pickup location

   **Receiver Information**:
   - Receiver Name: Recipient name
   - Destination City: Delivery location

   **Shipment Details**:
   - Weight: In kilograms
   - Estimated Delivery Date: Expected delivery date
   - Initial Status: Starting status

4. Click **"Create Shipment"** button
5. System generates:
   - Unique Shipment ID (e.g., AXN001)
   - Tracking Number (e.g., AXN001-2025-001)
   - First update entry

---

## 🗺️ Live Tracking - How It Works

### For Customers:
1. Go to **tracking.html**
2. Enter tracking number (e.g., AXN001-2025-001)
3. View:
   - **Shipment Details Card**: All shipment information
   - **Live Map**: Route from pickup to delivery with markers
   - **Status Timeline**: All updates with timestamps
   - **Progress Bar**: Visual journey progress

### Map Features:
- 🟢 **Green Marker** = Pickup point
- 🔴 **Red Marker** = Delivery destination
- 🔵 **Blue Markers** = Intermediate stops
- **Route Line** = Shipment path (dashed blue line)
- **Zoom/Pan**: Interactive map controls

### Timeline Features:
- 🔵 **Pending Updates**: Current status (blue dot)
- ✅ **Completed Updates**: Past status (green dot)
- **Timestamps**: Date and time of each update
- **Location Info**: City where update occurred
- **Message**: What happened at that point

---

## 👥 Client Management

### Adding a Client:
1. Go to Admin Dashboard
2. Click **"Clients"** tab
3. Click **"Add Client"** button
4. Fill in:
   - Client Name
   - Email Address
   - Phone Number
   - Address

5. Click **"Save Client"**

### Editing a Client:
1. Find client in the table
2. Click **Edit button** (pencil icon)
3. Modal opens with current information
4. Update fields as needed
5. Click **"Save Client"**

### Deleting a Client:
1. Find client in table
2. Click **Delete button** (trash icon)
3. Confirm deletion
4. Client removed from system

---

## 📱 Contact & Communication

### Company Information:
- **Name**: Axon Logistics
- **Address**: 1234 Commerce Drive, Minneapolis, MN 55401, USA
- **Phone**: +1 (763) 461-4006
- **WhatsApp**: +1 (763) 461-4006

### On Website:
- WhatsApp button links directly to chat: `https://wa.me/17634614006`
- Company location shown on interactive map
- Full address displayed in multiple locations
- Phone number prominently featured

---

## 🎨 Customization Guide

### Change Company Information:
Edit `js/data.js` line ~200:
```javascript
const AXON_HQ = {
  name: 'Axon Logistics Headquarters',
  lat: 44.9537,           // Latitude
  lng: -93.0900,          // Longitude
  address: '1234 Commerce Drive, Minneapolis, MN 55401, USA',
  whatsapp: '+1 (763) 461-4006'
};
```

### Add More Cities for Tracking:
Edit `js/data.js` MAJOR_CITIES array:
```javascript
const MAJOR_CITIES = [
  { city: 'Your City', state: 'ST', lat: 0.0000, lng: 0.0000 },
  // ... more cities
];
```

### Change Colors:
Edit `css/style.css` line ~1:
```css
:root {
  --primary-color: #1e40af;      /* Main blue */
  --secondary-color: #0284c7;    /* Light blue */
  --success-color: #10b981;      /* Green */
  --warning-color: #f59e0b;      /* Orange */
  --danger-color: #ef4444;       /* Red */
}
```

### Change Logo:
Replace `assets/logo.svg` with your own logo file (must be SVG for best results)

---

## 📊 Data Management

### Where Data is Stored:
- **Browser LocalStorage**: All data stored locally in user's browser
- **No Server Required**: Works completely offline
- **Persistent**: Data remains until browser data is cleared

### Sample Data Included:
The system comes with 3 pre-loaded shipments for testing:
1. **AXN001-2025-001**: In Transit (Los Angeles → New York)
2. **AXN002-2025-002**: Out for Delivery (Chicago → Miami)
3. **AXN003-2025-003**: Delivered (Seattle → Boston)

### Reset Data:
To reset to default data:
1. Open browser developer console (F12)
2. Type: `localStorage.removeItem('axonData')`
3. Refresh the page
4. Sample data will reload

---

## 🔧 Troubleshooting

### Tracking Number Not Found:
- Check spelling carefully
- Use exact format: AXN001-2025-001
- Sample numbers: AXN001-2025-001, AXN002-2025-002, AXN003-2025-003
- Create new shipment if needed

### Map Not Loading:
- Check internet connection (uses OpenStreetMap)
- Refresh the page
- Clear browser cache

### Data Lost After Refresh:
- Data is stored in LocalStorage
- Check browser privacy/incognito settings
- Ensure LocalStorage is not disabled
- Try a different browser

### Admin Changes Not Showing:
- Refresh the page (Ctrl+R or Cmd+R)
- Close and reopen admin dashboard
- Check browser console for errors (F12)

---

## 📱 Mobile Support

### Features on Mobile:
- ✅ Responsive design works on all devices
- ✅ Touch-friendly buttons and inputs
- ✅ Maps zoom with pinch gesture
- ✅ Navigation adapts to screen size
- ✅ Forms stack vertically for easy input

### Best Practices:
- Use tracking page on phone for customer tracking
- Use admin dashboard on desktop for management
- Maps work better with zoom on desktop

---

## 🔒 Security Notes

### Current Setup:
- No server authentication required
- Data stored locally in browser
- No external API calls (except maps)
- Suitable for: Small business, demo, internal use

### For Production:
- Implement backend server
- Add user authentication
- Database instead of LocalStorage
- HTTPS encryption
- Backup systems

---

## 📞 Support Information

### For Questions:
- Review README.md for overview
- Check this guide for detailed help
- Inspect code comments in HTML/JS files
- Use browser console (F12) to debug

### Key Files:
- `js/data.js` - All data management logic
- `css/style.css` - Styling and layout
- `index.html` - Homepage
- `tracking.html` - Tracking page
- `admin/dashboard.html` - Admin panel

---

## ✅ Checklist for Setup

- ✅ Download/Extract all files
- ✅ Open START.html in browser
- ✅ Test homepage functionality
- ✅ Try tracking with sample numbers
- ✅ Access admin dashboard
- ✅ Create a test shipment
- ✅ Update shipment status
- ✅ Verify map display
- ✅ Check WhatsApp link
- ✅ Test on mobile device

---

**Ready to use! Contact support for any issues.**

Version 1.0 | January 2025 | Axon Logistics
