const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// State tracking
const connectedClients = new Map(); // Using Map to store client info
let messageCount = 0;
let lastLogTime = Date.now();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => res.redirect('/receiver/'));
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    connections: connectedClients.size,
    uptime: process.uptime()
  });
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  const clientIp = socket.handshake.address;
  console.log(`Client connected from ${clientIp}`);

  // Store client with additional metadata
  connectedClients.set(socket.id, {
    socket,
    ip: clientIp,
    connectedAt: new Date()
  });


  // Écoute des événements 'sensor-data' (remplace 'message' dans votre version originale)
  socket.on('sensor-data', (data) => {
    try {
      console.log('Données reçues:', data);

      // Diffusion à tous les autres clients (méthode Socket.IO)
      socket.broadcast.emit('sensor-data', data);

      // Ou pour émettre à tout le monde (y compris l'émetteur) :
      // io.emit('sensor-data', data);
    } catch (error) {
      console.error('Erreur de traitement:', error);
    }
  });

  // Send connection confirmation
  socket.emit('info', {
    message: 'Connected to Socket.IO server',
    clients: connectedClients.size
  });

  // Message handler
  socket.on('message', (data) => {
    messageCount++;
    logStats();

    try {
      // Handle different message types
      switch(data.type) {
        case 'panelInfo':
          console.log(`Panel info for ${data.panelId}: ${data.width}x${data.height} (${data.aspectRatio})`);
          break;

        case 'frame':
          const hasValidImage = data.data && data.data.startsWith('data:image');
          console.log(`Frame from ${data.panelId}: ${hasValidImage ? 'valid' : 'INVALID'} image, ${data.data ? (data.data.length / 1024).toFixed(1) : 0}KB`);
          if (!hasValidImage) console.error('Invalid image data detected');
          break;

        default:
          if (data.type !== 'frame') {
            console.log(`Message: ${data.type} from panel ${data.panelId || 'unknown'}`);
          }
      }

      // Broadcast to all other clients
      socket.broadcast.emit('message', data);

    } catch (error) {
      console.error('Error processing message:', error);
      if (data) console.error('Message start:', JSON.stringify(data).substring(0, 100));
    }
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`Client disconnected from ${clientIp}`);
    connectedClients.delete(socket.id);
  });
});

// Helper function for periodic stats logging
function logStats() {
  const now = Date.now();
  if (now - lastLogTime > 5000) {
    console.log(`Stats: ${messageCount} messages in the last 5 seconds, ${connectedClients.size} clients connected`);
    messageCount = 0;
    lastLogTime = now;
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Receiver page available at http://localhost:${PORT}/receiver/`);
  console.log(`Individual panels available at:`);
  console.log(`  - Left Panel: http://localhost:${PORT}/receiver/left-panel.html`);
  console.log(`  - Center Panel: http://localhost:${PORT}/receiver/center-panel.html`);
  console.log(`  - Right Panel: http://localhost:${PORT}/receiver/right-panel.html`);
  console.log(`Mad Mapper adapter available at http://localhost:${PORT}/madmapper-adapter.html`);
  console.log(`Server status available at http://localhost:${PORT}/status`);
});
