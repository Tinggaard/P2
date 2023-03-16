// Define express and ws
const express = require('express');
const { Server } = require('ws');

// express server implementation
const server = express()
  .use((req, res) => res.sendFile('public/gridInterface.html', { root: __dirname }))
  .listen(3000, () => console.log(`Listening on ${3000}`));

// Create a new instance of ws server
const wsServer = new Server({ server });
// Print to console on client connected
wsServer.on('connection', (ws) => {
  console.log('New client connected!');

  ws.on('message', (message) => {
    console.log('received: %s', message);
    wsServer.clients.forEach((client) => {
      client.send(message);
    });
  });

  // Print to console on client disconnected
  ws.on('close', () => console.log('Client has disconnected'));
});

// Just for checking information is sent to the clients
setInterval(() => {
  wsServer.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);
