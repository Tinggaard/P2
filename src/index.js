const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// giver mappen til express
app.use(express.static('public'));

// problem creator
const operators = ['+', '-', '*', '/'];
// laver 50 matematik stykker
// underscoren er en placeholder for en variable
const problems = Array.from({ length: 50 }, (_, i) => ({
  index: i + 1, // for at holde styr på hver index af problemet
  problem: `${Math.floor(Math.random() * 10) + 1} ${operators[Math.floor(Math.random() * operators.length)]} 
            ${Math.floor(Math.random() * 10) + 1}`,
  // laver problemet
}));

let clientIdCounter = 1; // id
let clientCount = 0; // antal joinet
let femfyre = false; // er der 5 dudes

function updateUserCount() {
  const userCount = { type: 'usercount', count: clientCount }; // laver objekt
  wss.clients.forEach((client) => { // tæller hvor mange
    client.send(JSON.stringify(userCount)); // sender det til clientside bruges i html
  });
}

wss.on('connection', (ws) => { // når der joiner en
  clientCount++; // tæller en op
  const clientId = clientIdCounter++; // id'et er simpelt nok at sætte til bare det nummer man var
  console.log(`Client ${clientId} connected`); // logger det på serveren

  // Send the client ID back to the client
  ws.send(`Your id is: ${clientId}`); // sender ideet til client side

  // mens der stadig ikke er 5 dudes updater vi
  if (clientCount < 5) {
    updateUserCount();
  } else if (!femfyre) {
    femfyre = true; // når 5 er joinet så er vi klar

    const clients = Array.from(wss.clients);
    // .sort((a, b) => a.clientId - b.clientId); måske skal vi sorte i fremtiden?

    // regner hvor mange problemer pr dude
    const problemsPerClient = Math.floor(problems.length / 5);

    // sender hver dude sit problem
    for (let i = 0; i < 5; i++) {
      // laver et array group som har subset af problemer
      const group = problems.slice(i * problemsPerClient, (i + 1) * problemsPerClient)
      // mapper hver problem til et nyt object og gemmer indexet
        .map((problem) => ({
          index: problem.index,
          problem: problem.problem,
        }));
      // laver det til en json string og sender det
      clients[i].send(JSON.stringify(group));
    }

    // Update
    updateUserCount();
  } else {
    // Update
    updateUserCount();
  }
  // når der lukkes tælles det ned
  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clientCount--;

    // sikre at problems ikke bliver distribuereret
    if (clientCount < 5) {
      femfyre = false;
    }

    // altid update
    updateUserCount();
  });
});

// har stjålet det her så fatter ikke line 89
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
