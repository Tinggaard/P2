// Define express and ws
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import { Obj, Task } from './control.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const results = [];
let resNr = 0;

const weights = [
  [0, 2, 3, 4, 5],
  [4, 0, 2, 1, 3],
  [7, 3, 0, 3, 6],
  [8, 1, 100, 0, 7],
  [1, 9, 8, 5, 0],
];

const task = new Task(5, weights);
const iterator = task.getNextCombination();

// express server implementation
const exServer = express()
  // make the entire /public directory available
  .use(express.static(path.join(dirname, 'public')))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));

// Create a new instance of ws server
const wsServer = new WebSocketServer({ server: exServer });

wsServer.on('connection', (webSocket) => {
  // const available = new Obj('available', true);
  const id = new Obj('id', uuidv4());
  console.log(`${id.data}: *Connected*`);
  // Print number of clients connected
  console.log('Connected clients:', wsServer.clients.size);

  // at first connect, we send the ID to the client
  webSocket.send(JSON.stringify(id));

  const weightsObj = new Obj('weights', weights);
  webSocket.send(JSON.stringify(weightsObj));

  let problem = iterator.next();

  if (!problem.done) {
    const obj = new Obj('calc', problem.value);
    webSocket.send(JSON.stringify(obj));
  }

  // log messages we get in
  webSocket.on('message', (message) => {
    // determine type of data
    const data = JSON.parse(message);
    switch (data.type) {
      // Shows that the server recieves a solution from the client.
      case 'result':
        results[resNr] = `${data.data}`;
        resNr += 1;
        console.log(`received result: ${data.data}`);

        problem = iterator.next(); // send new problem
        if (!problem.done) {
          const obj = new Obj('calc', problem.value);
          webSocket.send(JSON.stringify(obj));
        }
        break;
      // do nothing
      default:
        break;
    }
  });

  // Print to console on client disconnected
  webSocket.on('close', () => {
    console.log(`${id.data}: *Disconnected*`);
    task.unfinished.push(problem.value); // add permutation back to task class
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
