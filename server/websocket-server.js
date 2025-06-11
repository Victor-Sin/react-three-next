const express = require("express");
const { createServer } = require("http"); // Importe le module HTTP de Node.js
const { Server } = require("socket.io");
const cors = require("cors");

const port = process.env.PORT || 8080;

const app = express();
const server = createServer(app);
const ioServ = new Server(server, {
  cors: {
    origin: "*", // Permettre à toutes les origines. Ajustez pour restreindre.
    methods: ["GET", "POST"],
    credentials: true,
  },
});

module.exports.io = ioServ;

//middleware
app.use(cors());
app.use(express.json({ limit: "5GB" }));
app.use(express.urlencoded({ limit: "5GB", extended: false }));
app.use("/static", express.static("static"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

// Structure de données pour stocker les sessions et les clients associés

// Gestion des connexions Socket.IO
ioServ.on("connection", (socket) => {
  console.log("Nouvelle connexion socket :", socket.id);

  // Gestion de la déconnexion d'un client
  socket.on("sensor-data", data => {
    try {
      // Si les données sont déjà un objet (cas où le client envoie directement un objet)
      if (typeof data.data === 'object') {
        console.log("Sensor data (objet):", data);
      }
      // Si les données sont une chaîne JSON (comme dans votre exemple)
      else if (typeof data.data === 'string') {
        const parsedData = JSON.parse(data.data);
        console.log("Sensor data (parsed):", parsedData);

        // Maintenant vous pouvez travailler avec parsedData comme un objet
        if (parsedData.sensors && Array.isArray(parsedData.sensors)) {
          parsedData.sensors.forEach(sensor => {
            console.log(`Line: ${sensor.line}, Col: ${sensor.col}, Freq: ${sensor.freq}, Dist: ${sensor.dist}`);
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors du parsing des données:", error);
    }
  });

  // Gestion de la déconnexion d'un client
  socket.on("disconnect", (gameId) => {
    console.log("Déconnexion socket :", socket.id);
    // Supprimer le client déconnecté de toutes les sessions
  });
});

server.listen(port,"0.0.0.0", () => {
  console.log("port : " + port);
});
