// Define express and ws
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { WebSocketServer } from 'ws';
import { Obj, Task } from './control.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

let finishedSubtasks = 0;

const weights = [
  [0, 2, 3, 4, 5, 7, 7, 3, 5, 3, 6, 4],
  [4, 0, 2, 1, 3, 8, 7, 3, 0, 3, 6, 4],
  [7, 3, 0, 3, 6, 4, 7, 3, 0, 3, 6, 4],
  [8, 1, 100, 0, 7, 2, 7, 3, 0, 3, 6, 2],
  [1, 9, 8, 5, 0, 7, 7, 3, 0, 3, 6, 4],
  [7, 3, 0, 3, 6, 0, 7, 3, 0, 3, 6, 4],
  [0, 2, 3, 4, 5, 7, 0, 3, 0, 3, 6, 4],
  [4, 0, 2, 1, 3, 8, 7, 0, 0, 3, 6, 4],
  [7, 3, 0, 3, 6, 4, 7, 3, 0, 3, 6, 4],
  [8, 1, 100, 0, 7, 2, 7, 3, 3, 0, 6, 2],
  [1, 9, 8, 5, 0, 7, 7, 3, 0, 3, 0, 4],
  [7, 3, 0, 3, 6, 4, 7, 3, 0, 3, 6, 0],
];

const task = new Task(weights.length, weights);
// A perhaps scuffed way to calculate total subtasks..
function factorial(num) {
  let result = 1;
  for (let i = 2; i < num; i++) {
    result *= i;
  }
  return result;
}

const totalSubtasks = new Obj('totalSubtasks', (factorial(weights.length) / factorial(weights.length - task.subtaskLength)));
console.log(totalSubtasks);
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

  // at first connect, we send the ID and total amount of subtasks to the client
  webSocket.send(JSON.stringify(id));
  webSocket.send(JSON.stringify(totalSubtasks));

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
        // If the entire task is completed output the shortest path in the HTML file.
        if (finishedSubtasks === totalSubtasks.data) {
          const obj = new Obj('finalResult', task);
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
    const progress = new Obj('progress', finishedSubtasks);
    client.send(JSON.stringify(progress));
  });
}, 1000);
