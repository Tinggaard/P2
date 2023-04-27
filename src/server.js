// Define express and ws
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import { Obj, Task } from './control.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
// initialization of variables
let finishedSubtasks = 0;
let iterator;
let totalSubtasks;
let task;
let fileWeightsObj;
// express server implementation
const app = express();
const appServer = app.use(express.static(path.join(dirname, 'public')))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));
let fileWeights;
app.post('/server-weights', (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      // this is where it comes in
      fileWeights = JSON.parse(body);
      fileWeightsObj = new Obj('weights', fileWeights.weights);
      task = new Task(fileWeightsObj.data.length, fileWeights.weights);
      console.log(fileWeightsObj);
      // A perhaps scuffed way to calculate total subtasks..
      totalSubtasks = new Obj('totalSubtasks', ((task.nodeCount - 1) * (task.nodeCount - 2)));
      iterator = task.getNextCombination();
    } catch (err) {
      console.error('Error parsing JSON:', err);
      res.status(400).json({ error: 'Invalid JSON data' });
    }
  });
});

// const weights = [
//   [0, 2, 3, 4, 5, 7, 7, 3, 0, 3, 6, 4, 5, 2],
//   [4, 0, 2, 1, 3, 8, 7, 3, 0, 3, 6, 4, 5, 2],
//   [7, 3, 0, 3, 6, 4, 7, 3, 0, 3, 6, 4, 5, 2],
//   [8, 1, 100, 0, 7, 2, 7, 3, 0, 3, 6, 4, 5, 2],
//   [1, 9, 8, 5, 0, 7, 7, 3, 0, 3, 6, 4, 5, 2],
//   [7, 3, 0, 3, 6, 0, 7, 3, 0, 3, 6, 4, 5, 2],
//   [0, 2, 3, 4, 5, 7, 0, 3, 0, 3, 6, 4, 5, 2],
//   [4, 0, 2, 1, 3, 8, 7, 0, 0, 3, 6, 4, 5, 2],
//   [7, 3, 0, 3, 6, 4, 7, 3, 0, 3, 6, 4, 5, 2],
//   [8, 1, 100, 0, 7, 2, 7, 3, 3, 0, 6, 4, 5, 2],
//   [1, 9, 8, 5, 0, 7, 7, 3, 0, 3, 0, 4, 5, 2],
//   [7, 3, 0, 3, 6, 4, 7, 3, 0, 3, 6, 0, 5, 2],
//   [7, 3, 0, 3, 6, 0, 7, 3, 0, 3, 6, 4, 0, 2],
//   [0, 2, 3, 4, 5, 7, 0, 3, 0, 3, 6, 4, 5, 0],
// ];
// fileweights is an object so we have to get the length somehow :)

// Create a new instance of ws server
const wsServer = new WebSocketServer({ server: appServer });

wsServer.on('connection', (webSocket) => {
  // const available = new Obj('available', true);
  const id = new Obj('id', uuidv4());
  console.log(`${id.data}: *Connected*`);
  // Print number of clients connected
  console.log('Connected clients:', wsServer.clients.size);

  // at first connect, we send the ID and total amount of subtasks to the client
  webSocket.send(JSON.stringify(id));
  webSocket.send(JSON.stringify(totalSubtasks));

  webSocket.send(JSON.stringify(fileWeightsObj));

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
        finishedSubtasks += 1;
        console.log(`received result: ${data.data.route}  |   length: ${data.data.routeLength}`);

        if (task.shortestSum > data.data.routeLength) {
          task.shortestPath = data.data.route.slice();
          task.shortestSum = data.data.routeLength;
        }
        problem = iterator.next(); // send new problem
        if (!problem.done) {
          const obj = new Obj('calc', problem.value);
          webSocket.send(JSON.stringify(obj));
        }
        console.log(`shortest route:  ${task.shortestPath}  |   shortest route length ${task.shortestSum}`);
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
    const progress = new Obj('progress', finishedSubtasks);
    client.send(JSON.stringify(progress));
  });
}, 1000);
