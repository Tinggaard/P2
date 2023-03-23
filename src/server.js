// Define express and ws
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// create object to send over WebSocket
function Obj(type, data) {
  this.type = type;
  this.data = data;
}

// const tasks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// express server implementation
const exServer = express()
  // make the entire /public directory available
  .use(express.static(path.join(dirname, 'public')))
  .listen(3000, () => console.log(`Listening on ${3000}`));

// Create a new instance of ws server
const wsServer = new WebSocketServer({ server: exServer });
// Print to console on client connected
wsServer.on('connection', (webSocket) => {
  // const available = new Obj('available', true);
  const id = new Obj('id', uuidv4());
  console.log(`${id.data}: *Connected*`);
  // Print number of clients connected
  console.log('Connected clients:', wsServer.clients.size);

  // at first connect, we send the ID to the client
  webSocket.send(JSON.stringify(id));
  // Send numbers for calc
  const A = [7, 19];
  const calcMessage = new Obj('calc', A);
  webSocket.send(JSON.stringify(calcMessage));

  // log messages we get in
  webSocket.on('message', (message) => {
    console.log(`${id.data}: ${message}`);
  });

  // Print to console on client disconnected
  webSocket.on('close', () => {
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

// Submitting a task to each client
// setInterval(() => {
//  let taskIndexX = 0;
//  let taskIndexY = 1;
//  wsServer.clients.forEach((client) => {
//    const calcMessage = new Obj('calc', (tasks[taskIndexX], tasks[taskIndexY]));
//    client.send(JSON.stringify(calcMessage));
//    taskIndexX += 2;
//    taskIndexY += 2;
//   });
// }, 1000);
