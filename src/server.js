// Define express and ws
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';

import { Obj, assignTask } from './public/app.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

let taskNumber = 0;
let resNr = 0;
const allTasks = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]];
const results = [];

// express server implementation
const exServer = express()
  // make the entire /public directory available
  .use(express.static(path.join(dirname, 'public')))
  .get('/', (req, res) => {
    res.sendFile(path.join(dirname, 'public/clientUI.html'));
  })
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

  // log messages we get in
  webSocket.on('message', (message) => {
    // determine type of data
    switch (message.type) {
      case 'result':
        results[resNr] = `${message.data}`;
        resNr += 1;
        console.log(results);
        break;
        // do nothing
      default:
        break;
    }
    taskNumber = assignTask(allTasks, taskNumber, webSocket);
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
