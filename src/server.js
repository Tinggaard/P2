// Define express and ws
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { Task, sendObj } from './control.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// initialization of variables
let finishedSubtasks = 0;
let currentTask;
const allTasksQueue = [];
const allSolutions = [];

// Express server implementation
const app = express();
const appServer = app.use(express.static(path.join(dirname, 'public')))
  .listen(3000, () => console.log('Server running at http://localhost:3000'));

function sendWeights(webSocket) {
  sendObj(webSocket, 'weights', currentTask.weights);
  sendObj(webSocket, 'totalSubtasks', currentTask.subtaskAmount);
}

// Create a new instance of ws server
const wsServer = new WebSocketServer({ server: appServer });
wsServer.on('connection', (webSocket) => {
  // Print and send number of clients connected.
  wsServer.clients.forEach((client) => {
    sendObj(client, 'clientCounter', wsServer.clients.size);
  });

  let subtaskIterator;

  if (currentTask !== undefined) {
    sendWeights(webSocket);
  }

  sendObj(webSocket, 'queue', allTasksQueue);
  sendObj(webSocket, 'solutions', allSolutions);

  // Handle messages we get in
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
        subtaskIterator = currentTask.iterator.next(); // Send new problem
        if (subtaskIterator && !subtaskIterator.done) {
          // currentSubtask = subtaskIterator.value;
          sendObj(webSocket, 'calc', subtaskIterator.value);
        }
        // If the entire task is completed output the shortest path in the HTML file.
        if (finishedSubtasks === currentTask.subtaskAmount) {
          allSolutions.unshift(currentTask);
          wsServer.clients.forEach((client) => {
            sendObj(client, 'solutions', allSolutions);
          });

          // If there are tasks in the queue, a task is dequeued and it becomes the current task
          if (allTasksQueue.length > 0) {
            finishedSubtasks = 0;
            currentTask = allTasksQueue.shift();
            wsServer.clients.forEach((client) => {
              sendWeights(client);
              sendObj(client, 'queue', allTasksQueue);
            });
          } else {
            currentTask = undefined;
          }
        }
        break;

      case 'subtaskRequest':
        subtaskIterator = currentTask.iterator.next(); // Send new problem
        if (subtaskIterator && !subtaskIterator.done) {
          // currentSubtask = subtaskIterator.value;
          sendObj(webSocket, 'calc', subtaskIterator.value);
        }
        break;

      default:
        break;
    }
  });

  webSocket.on('close', () => {
    // Check if the grid is currently doing a task
    if (subtaskIterator && !subtaskIterator.done) {
      currentTask.unfinished.push(subtaskIterator.value); // add permutation back to task class
    }
    // Print number of clients connected
    wsServer.clients.forEach((client) => {
      sendObj(client, 'clientCounter', wsServer.clients.size);
    });
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
      const fileName = JSON.parse(body).name; // Name of task
      const newWeights = JSON.parse(body).weights; // Store new weights

      // Creates the main task
      if (currentTask === undefined) {
      // Creating an object of the weights to be send to the client
        finishedSubtasks = 0;
        currentTask = new Task(newWeights.length, newWeights, fileName);

        wsServer.clients.forEach((client) => {
          sendWeights(client);
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

// Send the total progress each second
setInterval(() => {
  wsServer.clients.forEach((client) => {
    sendObj(client, 'progress', finishedSubtasks);
  });
}, 1000);
