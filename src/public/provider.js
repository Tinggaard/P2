import init, { bruteForce } from './wasm/tsp.js';

const weights = [
  [0, 2, 3, 4, 5],
  [4, 0, 2, 1, 3],
  [7, 3, 0, 3, 6],
  [8, 1, 100, 0, 7],
  [1, 9, 8, 5, 0],
];

init().then(() => {
  const result = bruteForce([2, 1], weights.flat(), weights.length);
  console.log(`Found shortest path to be ${result}`);
});

function bruteforce(staticRoute, weights) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialValue = 0;
      const sumWithInitial = staticRoute.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        initialValue,
      );
      resolve(sumWithInitial);
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
