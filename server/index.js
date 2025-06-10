const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

// Keep track of connected clients
const clients = new Set();
let messageCount = 0;
let lastLogTime = Date.now();

// Create express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Default route for the receiver
app.get('/', (req, res) => {
  res.redirect('/receiver/');
});

// Diagnostic route
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    connections: clients.size,
    uptime: process.uptime()
  });
});

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`Client connected from ${clientIp}`);
  clients.add(ws);

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Connected to WebSocket server',
    clients: clients.size
  }));

  // Handle messages from clients
  ws.on('message', (message) => {
    messageCount++;
    
    // Log stats every 5 seconds
    const now = Date.now();
    if (now - lastLogTime > 5000) {
      console.log(`Stats: ${messageCount} messages in the last 5 seconds, ${clients.size} clients connected`);
      messageCount = 0;
      lastLogTime = now;
    }
    
    try {
      const messageString = message.toString();
      const data = JSON.parse(messageString);
      
      // Log panel info messages
      if (data.type === 'panelInfo') {
        console.log(`Panel info for ${data.panelId}: ${data.width}x${data.height} (${data.aspectRatio})`);
      }
      
      // For frames, log minimal info to avoid console spam
      if (data.type === 'frame') {
        // Check if data is valid and log basic info
        const hasValidImage = data.data && data.data.startsWith('data:image');
        console.log(`Frame from ${data.panelId}: ${hasValidImage ? 'valid' : 'INVALID'} image, ${data.data ? (data.data.length / 1024).toFixed(1) : 0}KB`);
        
        if (!hasValidImage) {
          console.error('Invalid image data detected');
        }
      }
      // Don't log every frame message to avoid console spam
      else if (data.type !== 'frame') {
        console.log(`Message: ${data.type} from panel ${data.panelId || 'unknown'}`);
      }
      
      // Broadcast to all other clients
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          try {
            client.send(messageString);
          } catch (error) {
            console.error('Error sending to client:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error processing message:', error);
      console.error('Message start:', message.toString().substring(0, 100));
    }
  });

  // Handle disconnections
  ws.on('close', () => {
    console.log(`Client disconnected from ${clientIp}`);
    clients.delete(ws);
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Receiver page available at http://localhost:${PORT}/receiver/`);
  console.log(`Individual panels available at:`);
  console.log(`  - Left Panel: http://localhost:${PORT}/receiver/left-panel.html`);
  console.log(`  - Center Panel: http://localhost:${PORT}/receiver/center-panel.html`);
  console.log(`  - Right Panel: http://localhost:${PORT}/receiver/right-panel.html`);
  console.log(`Mad Mapper adapter available at http://localhost:${PORT}/madmapper-adapter.html`);
  console.log(`Server status available at http://localhost:${PORT}/status`);
});