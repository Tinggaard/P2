const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// giver mappen til express
app.use(express.static('public'));

function isValidJSON(message) {
  try {
    JSON.parse(message);
    return true;
  } catch (error) {
    return false;
  }
}

const operators = ['+', '-', '*', '/'];
const problems = Array.from({ length: 50000 }, (_, i) => ({
  index: i + 1,
  problem: `${Math.floor(Math.random() * 10) + 1} ${operators[Math.floor(Math.random() * operators.length)]} 
            ${Math.floor(Math.random() * 10) + 1}`,
}));

let nextProblemIndex = 0;

function getNextProblem() {
  if (nextProblemIndex < problems.length) {
    const problem = problems[nextProblemIndex];
    nextProblemIndex++;
    return problem;
  }
  return null;
}

let clientIdCounter = 1;
let clientCount = 0;

function updateUserCount() {
  const userCount = { type: 'usercount', count: clientCount };
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(userCount));
    }
  });
}

wss.on('connection', (ws) => {
  clientCount++;
  const clientId = clientIdCounter++;
  console.log(`Client ${clientId} connected`);

  ws.send(`Your id is: ${clientId}`);

  const initialProblem = getNextProblem();
  if (initialProblem) {
    ws.send(JSON.stringify([initialProblem]));
  }

  updateUserCount();

  ws.on('message', (message) => {
    if (isValidJSON(message)) {
      const data = JSON.parse(message);
      if (data.type === 'answer') {
        console.log(
          `Client ${data.clientId} solved problem ${data.problemIndex}: Answer = ${data.answer}`,
        );

        const newProblem = getNextProblem();
        if (newProblem) {
          ws.send(JSON.stringify([newProblem]));
        }
      }
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clientCount--;

    updateUserCount();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
