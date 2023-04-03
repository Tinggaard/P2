// Define express and ws
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import {
  Obj, assignTask, nextPermutation,
} from './control.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Initializes all variables to be used by the server when dividing a task into subtasks
const subtaskLength = 4;
const currCombination = Array.from({ length: subtaskLength }, (_, i) => i + 1); // !const? (eslint)!
const TSPnodes = 6;
let currPerm = currCombination.slice();
const c = new Array(currPerm.length).fill(0);
let i = 0;
let subTasks = [];
const results = [];
let resNr = 0;

// eslint-disable-next-line max-len
[subTasks, i, currPerm] = nextPermutation(currPerm, subtaskLength, c, i, currCombination, TSPnodes, 5);

// express server implementation
const exServer = express()
  // make the entire /public directory available
  .use(express.static(path.join(dirname, 'public')))
  .listen(3000, () => console.log(`Server running at http://localhost:${3000}`));

// Create a new instance of ws server
const wsServer = new WebSocketServer({ server: exServer });
// Print to console on client connected
let currentTask;
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
    const data = JSON.parse(message);
    switch (data.type) {
      // Shows that the server recieves a solution from the client.
      case 'result':
        results[resNr] = `${data.data}`;
        resNr += 1;
        console.log(data.data);
        break;
        // do nothing
      default:
        break;
    }

    if (subTasks.length === 0) {
      // eslint-disable-next-line max-len
      [subTasks, i, currPerm] = nextPermutation(currPerm, subtaskLength, c, i, currCombination, TSPnodes, 5);
    }
    currentTask = assignTask(subTasks, webSocket); // This function sends the tasks.
  });

  // Print to console on client disconnected
  webSocket.on('close', () => {
    console.log(`${id.data}: *Disconnected*`);
    // Print number of clients connected
    subTasks.push(currentTask);
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
