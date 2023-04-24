import init, { bruteForce } from './wasm/tsp.js';

init().then();

function calcRouteLength(weights, route) {
  let routeLength = 0;
  for (let i = 0; i < route.length - 1; i++) {
    routeLength += weights[route[i]][route[i + 1]];
  }
  return routeLength;
}

function calcRoute(staticRoute, weights) {
  return new Promise((resolve) => {
    const arr = bruteForce(staticRoute, weights.flat(), weights.length);
    // New array with starting point and the static route
    const subtaskResult = { route: [0, staticRoute].flat(), routeLength: -1 };

    // Add the wasm array to js array
    for (let i = 0; i < arr.length; i++) {
      subtaskResult.route.push(arr[i]);
    }

    // Add the last point of the route
    subtaskResult.route.push(0); // Append the route finish
    console.log('test: ', subtaskResult);
    // Calculate route length and add to subtask object
    subtaskResult.routeLength = calcRouteLength(weights, subtaskResult.route);

    resolve(subtaskResult);
  });
}

// Gives data a type to send data between client and server
function Obj(type, data) {
  this.type = type;
  this.data = data;
}

// Function for printing result on website and sending result back to server
async function subtaskHandler(data, weights, webSocket) {
  await (calcRoute(data, weights))
    .then((result) => {
      const selector = document.querySelector('#calculation');
      selector.innerHTML += `Calculation received: ${data}, final calculation: ${result.route} <br>`;
      const resultObj = new Obj('result', result);
      webSocket.send(JSON.stringify(resultObj));
    })
    .catch((err) => { console.log(err); });
}

export { Obj, subtaskHandler };
