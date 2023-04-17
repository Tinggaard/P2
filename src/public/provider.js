import { bruteForce } from './wasm/tsp.js';

function bruteforce(staticRoute, weights) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const shortestRoute = bruteForce(staticRoute, weights.flat(), weights.length);
      shortestRoute.unshift(staticRoute);
      shortestRoute.push(0);
      console.log(shortestRoute);
      resolve(shortestRoute);
    }, 1000);
  });
}

// Gives data a type to send data between client and server
function Obj(type, data) {
  this.type = type;
  this.data = data;
}

// Function for printing result on website and sending result back to server
async function subtaskHandler(data, weights, webSocket) {
  await (bruteforce(data, weights))
    .then((result) => {
      const selector = document.querySelector('#calculation');
      selector.innerHTML += `Calculation received: ${data}, final calculation: ${result} <br>`;
      const resultObj = new Obj('result', result);
      webSocket.send(JSON.stringify(resultObj));
    })
    .catch((err) => { console.log(err); });
}

export { Obj, subtaskHandler };
