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
let currentTask;
const allTasksQueue = [];
let fileWeightsObj;
let fileWeights = null;
let problem;
// Express server implementation
const app = express();
const appServer = app.use(express.static(path.join(dirname, 'public')))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));
// A perhaps scuffed way to calculate total subtasks..

function sendProblem(webSocket) {
  webSocket.send(JSON.stringify(fileWeightsObj));
  webSocket.send(JSON.stringify(currentTask.subtaskAmount));
  if (currentTask.iterator) {
    problem = currentTask.iterator.next();
  }
  // tjekker om problemet findes
  if (problem && !problem.done) {
    const obj = new Obj('calc', problem.value);
    webSocket.send(JSON.stringify(obj));
  }
}

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

  if (currentTask !== undefined) {
    sendProblem(webSocket);
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

        if (currentTask.shortestSum > data.data.routeLength) {
          currentTask.shortestPath = data.data.route.slice();
          currentTask.shortestSum = data.data.routeLength;
        }
        problem = currentTask.iterator.next(); // send new problem
        if (problem && !problem.done) {
          const obj = new Obj('calc', problem.value);
          webSocket.send(JSON.stringify(obj));
        }
        // If the entire task is completed output the shortest path in the HTML file.
        if (finishedSubtasks === currentTask.subtaskAmount.data) {
          console.log('done with task');
          const obj = new Obj('finalResult', currentTask);
          webSocket.send(JSON.stringify(obj));
          if (allTasksQueue.length > 0) {
            finishedSubtasks = 0;
            currentTask = allTasksQueue.shift();
            wsServer.clients.forEach((client) => {
              sendProblem(client);
            });
          } else {
            finishedSubtasks = 0;
            currentTask = undefined;
          }
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
    if (problem && !problem.done) { // tjekker om problemet findes
      currentTask.unfinished.push(problem.value); // add permutation back to task class
    }
    // Print number of clients connected
    console.log('Connected clients:', wsServer.clients.size);
  });
});

// Where the uploaded JSON file with weights is posted to
app.post('/server-weights', (req, res) => {
  let body = '';
  // Stringifies and concatenates the received data from the uploaded JSON file
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    // When a file is uploaded this runs
    try {
      console.log('file uploaded');
      // Objectifizing the uploaded problem.
      fileWeights = JSON.parse(body).weights;
      // Creating an object of the weights to be send to the client
      fileWeightsObj = new Obj('weights', fileWeights);
      // Creates the main task
      if (currentTask === undefined) {
        currentTask = new Task(fileWeights.length, fileWeights);
        wsServer.clients.forEach((client) => {
          sendProblem(client);
        });
      } else {
        allTasksQueue.push(new Task(fileWeights.length, fileWeights));
      }
      // Starts creating subtasks/static routes from the main task
    } catch (err) {
      console.error('Error parsing JSON:', err);
      res.status(400).json({ error: 'Invalid JSON data' });
    }
  });
});

// this checks if there are weights on the server
app.get('/weights', (req, res) => {
  // This checks if fileweights is empty. Should maybe be changed to objects.
  // this may cause problems later
  if (fileWeights != null) {
    res.json(true);
  }
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
