const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Data file path - use current directory
const dataFile = path.join(__dirname, "server-data.json");

function readData() {
    try {
        if (fs.existsSync(dataFile)) {
            const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            return {
                shipments: Array.isArray(parsed.shipments) ? parsed.shipments : [],
                clients: Array.isArray(parsed.clients) ? parsed.clients : []
            };
        }
    } catch (e) {
        console.error("Error reading data:", e.message);
    }
    return { shipments: [], clients: [] };
}

function writeData(data) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error("Error writing data:", e.message);
        return false;
    }
}

if (!fs.existsSync(dataFile)) {
    writeData({ shipments: [], clients: [] });
}

// API ROUTES FIRST (before static middleware) 
app.get("/api/shipments", (req, res) => {
    try {
        const data = readData();
        const shipments = data.shipments || [];
        console.log("GET /api/shipments - returning", shipments.length, "shipments");
        res.json(shipments);
    } catch (e) {
        console.error("GET /api/shipments - error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/shipments/:id", (req, res) => {
    try {
        const data = readData();
        const shipment = (data.shipments || []).find(s => s.id === req.params.id);
        if (shipment) {
            res.json(shipment);
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/shipments", (req, res) => {
    try {
        console.log("POST /api/shipments - received request");
        const data = readData();
        const shipment = req.body;
        
        if (!shipment.id) {
            const ts = Date.now().toString().slice(-3);
            shipment.id = "AXN" + ts;
            shipment.trackingNumber = shipment.id + "-2026-" + ts;
        }
        
        shipment.createdDate = shipment.createdDate || new Date().toISOString();
        data.shipments = data.shipments || [];
        data.shipments.unshift(shipment);
        
        const writeOk = writeData(data);
        if (writeOk) {
            console.log("POST /api/shipments - shipment saved with ID:", shipment.id);
            res.status(201).json(shipment);
        } else {
            console.error("POST /api/shipments - failed to write data");
            res.status(500).json({ error: "Failed to save" });
        }
    } catch (e) {
        console.error("POST /api/shipments - exception:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.put("/api/shipments/:id", (req, res) => {
    try {
        const data = readData();
        const i = (data.shipments || []).findIndex(s => s.id === req.params.id);
        if (i > -1) {
            data.shipments[i] = { ...data.shipments[i], ...req.body };
            writeData(data);
            res.json(data.shipments[i]);
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete("/api/shipments/:id", (req, res) => {
    try {
        const data = readData();
        const len = (data.shipments || []).length;
        data.shipments = (data.shipments || []).filter(s => s.id !== req.params.id);
        if (data.shipments.length < len) {
            writeData(data);
            res.json({ message: "Deleted" });
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/health", (req, res) => {
    res.json({ status: "OK" });
});

app.get("/api/clients", (req, res) => {
    try {
        const data = readData();
        res.json(data.clients || []);
    } catch (e) {
        console.error("GET /api/clients - error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/clients", (req, res) => {
    try {
        const data = readData();
        const client = req.body || {};

        if (!client.id) {
            const ts = Date.now().toString().slice(-3);
            client.id = "CLT" + ts;
        }

        client.createdDate = client.createdDate || new Date().toISOString();
        data.clients = data.clients || [];
        data.clients.unshift(client);

        if (writeData(data)) {
            res.status(201).json(client);
        } else {
            res.status(500).json({ error: "Failed to save client" });
        }
    } catch (e) {
        console.error("POST /api/clients - exception:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.delete("/api/clients/:id", (req, res) => {
    try {
        const data = readData();
        const previousLength = (data.clients || []).length;
        data.clients = (data.clients || []).filter(client => client.id !== req.params.id);

        if (data.clients.length < previousLength) {
            writeData(data);
            res.json({ message: "Deleted" });
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (e) {
        console.error("DELETE /api/clients/:id - exception:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// STATIC MIDDLEWARE AFTER API ROUTES
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`🚀 API running on port ${PORT}`);
});
