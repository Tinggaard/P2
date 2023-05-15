// Define express and ws
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { Obj, Task, sendObj } from './control.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
// initialization of variables
let finishedSubtasks = 0;
let currentTask;
const allTasksQueue = [];
const allSolutions = [];
let fileWeights = null;
let problem;
// Express server implementation
let start;
const app = express();
const appServer = app.use(express.static(path.join(dirname, 'public')))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));

function sendProblem(webSocket) {
  webSocket.send(JSON.stringify(new Obj('weights', currentTask.weights)));
  webSocket.send(JSON.stringify(currentTask.subtaskAmount));
  if (currentTask.iterator) {
    problem = currentTask.iterator.next();
  }
  // tjekker om problemet findes
  if (problem && !problem.done) {
    sendObj(webSocket, 'calc', problem.value);
  }
}

// Create a new instance of ws server
const wsServer = new WebSocketServer({ server: appServer });
wsServer.on('connection', (webSocket) => {
  // Print and send number of clients connected.
  wsServer.clients.forEach((client) => {
    sendObj(client, 'clientCounter', wsServer.clients.size);
  });
  console.log('Connected clients:', wsServer.clients.size);

  if (currentTask !== undefined) {
    sendProblem(webSocket);
  }

  sendObj(webSocket, 'queue', allTasksQueue);
  sendObj(webSocket, 'solutions', allSolutions);

  // log messages we get in
  webSocket.on('message', (message) => {
    // determine type of data
    const data = JSON.parse(message);
    switch (data.type) {
      // Shows that the server recieves a solution from the client.
      case 'result':
        finishedSubtasks += 1;

        if (currentTask.shortestSum > data.data.routeLength) {
          currentTask.shortestPath = data.data.route.slice();
          currentTask.shortestSum = data.data.routeLength;
        }
        problem = currentTask.iterator.next(); // send new problem
        if (problem && !problem.done) {
          sendObj(webSocket, 'calc', problem.value);
        }
        // If the entire task is completed output the shortest path in the HTML file.
        if (finishedSubtasks === currentTask.subtaskAmount.data) {
          console.log('Done with task');
          const end = performance.now();
          console.log(`Execution time: ${(end - start) * 1000} s`);
          allSolutions.unshift(currentTask);
          wsServer.clients.forEach((client) => {
            sendObj(client, 'time', end - start);
            sendObj(client, 'solutions', allSolutions);
          });
          if (allTasksQueue.length > 0) {
            finishedSubtasks = 0;
            currentTask = allTasksQueue.shift();
            fileWeights = currentTask.weights;
            start = performance.now();
            wsServer.clients.forEach((client) => {
              sendProblem(client);
              sendObj(client, 'queue', allTasksQueue);
            });
          } else {
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
    if (problem && !problem.done) { // tjekker om problemet findes
      currentTask.unfinished.push(problem.value); // add permutation back to task class
    }
    // Print and number of clients connected
    wsServer.clients.forEach((client) => {
      sendObj(client, 'clientCounter', wsServer.clients.size);
    });
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
      // name of task
      const fileName = JSON.parse(body).name;
      // store new weights
      const newWeights = JSON.parse(body).weights;
      // Creates the main task
      if (currentTask === undefined) {
      // Creating an object of the weights to be send to the client
        fileWeights = newWeights;
        finishedSubtasks = 0;
        currentTask = new Task(fileWeights.length, fileWeights, fileName);
        start = performance.now();
        wsServer.clients.forEach((client) => {
          sendProblem(client);
        });
      } else {
        allTasksQueue.push(new Task(newWeights.length, newWeights, fileName));
        wsServer.clients.forEach((client) => {
          sendObj(client, 'queue', allTasksQueue);
        });
      }
      res.sendStatus(200);
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

// Send the total progress each second
setInterval(() => {
  wsServer.clients.forEach((client) => {
    sendObj(client, 'progress', finishedSubtasks);
  });
}, 1000);
