// Define express and ws
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Server } = require('ws');

// create object to send over WebSocket
function Obj(type, data) {
  this.type = type;
  this.data = data;
}

// express server implementation
const server = express()
  // make the entire /public directory available
  .use(express.static(path.join(__dirname, 'public')))
  .listen(3000, () => console.log(`Listening on ${3000}`));

// Create a new instance of ws server
const wsServer = new Server({ server });
// Print to console on client connected
wsServer.on('connection', (ws) => {
  const id = new Obj('id', uuidv4());

  console.log(`${id.data}: *Connected*`);
  // Print number of clients connected
  console.log('Connected clients:', wsServer.clients.size);

  // at first connect, we send the ID to the client
  ws.send(JSON.stringify(id));

  // log messages we get in
  ws.on('message', (message) => {
    console.log(`${id.data}: ${message}`);
  });

  // Print to console on client disconnected
  ws.on('close', () => {
    console.log(`${id.data}: *Disconnected*`);
    // Print number of clients connected
    console.log('Connected clients:', wsServer.clients.size);
  });
});

// Just for checking information is sent to the clients
setInterval(() => {
  wsServer.clients.forEach((client) => {
    const time = new Obj('time', new Date().toTimeString());
    client.send(JSON.stringify(time));
  });
}, 1000);
