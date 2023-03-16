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

// problem creator
const operators = ['+', '-', '*', '/'];
// laver 50 matematik stykker
// underscoren er en placeholder for en variable
const problems = Array.from({ length: 50000 }, (_, i) => ({
  index: i + 1, // for at holde styr på hver index af problemet
  problem: `${Math.floor(Math.random() * 10) + 1} ${operators[Math.floor(Math.random() * operators.length)]} 
            ${Math.floor(Math.random() * 10) + 1}`,
  // laver problemet
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

let clientIdCounter = 1; // id
let clientCount = 0; // antal joinet

function updateUserCount() {
  const userCount = { type: 'usercount', count: clientCount }; // laver objekt
  wss.clients.forEach((client) => { // tæller hvor mange
    client.send(JSON.stringify(userCount)); // sender det til clientside bruges i html
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
