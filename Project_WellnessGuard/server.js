const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "", // Replace "" with your client origin for better security, e.g., "http://localhost:3000"
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// MQTT client setup
const mqttClient = mqtt.connect('mqtt://localhost');

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  const topics = [
    'stepcounter/steps',
    'stepcounter/inactivity',
    'pulsesensor/bpm'
  ];
  mqttClient.subscribe(topics, (err) => {
    if (!err) {
      console.log('Subscribed to topics:', topics);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  const payload = message.toString();
  io.emit('mqtt_message', { topic, payload });

  // Save data to SQLite database
  const timestamp = new Date().toISOString();
  if (topic === 'pulsesensor/bpm') {
    db.run('INSERT INTO heartrate (timestamp, bpm) VALUES (?, ?)', [timestamp, payload]);
    //console.log('Heart rate:', payload);
  } else if (topic === 'stepcounter/steps') {
    db.run('INSERT INTO steps (timestamp, steps) VALUES (?, ?)', [timestamp, payload]);
  } else if (topic === 'stepcounter/inactivity') {
    db.run('INSERT INTO inactivity (timestamp, status) VALUES (?, ?)', [timestamp, payload]);
  }
});

// SQLite3 setup
const db = new sqlite3.Database('mytopic.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Start the server with a specific host and port
const PORT = 3000;
const HOST = 'localhost'; // Replace with your desired host (e.g., local IP or domain)

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});