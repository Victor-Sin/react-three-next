const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Autoriser toutes les origines (à restreindre en production)
    methods: ["GET", "POST"]
  }
});

// Stockage des clients connectés (facultatif, car Socket.IO gère déjà les connexions)
const connectedClients = new Set();

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Nouveau client connecté:', socket.id);
  connectedClients.add(socket.id);

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

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
    connectedClients.delete(socket.id);
  });
});

// Démarrer le serveur
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Serveur Socket.IO en écoute sur le port ${PORT}`);
});
