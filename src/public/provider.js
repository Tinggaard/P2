import init, { bruteForce } from './wasm/tsp.js';

init();

function calcRouteLength(weights, route) {
  let routeLength = 0;
  for (let i = 0; i < route.length - 1; i++) {
    routeLength += weights[route[i]][route[i + 1]];
  }
  return routeLength;
}

function calcRoute(staticRoute, weights) {
  return new Promise((resolve) => {
    // Call Webassembly function
    const arr = bruteForce(staticRoute, weights.flat(), weights.length);
    // New array with starting point and the static route
    const subtaskResult = { route: [0, staticRoute].flat(), routeLength: -1 };

    // Add the wasm array to js array
    for (let i = 0; i < arr.length; i++) {
      subtaskResult.route.push(arr[i]);
    }

    // Add the last point of the route
    subtaskResult.route.push(0); // Append the route finish
    // Calculate route length and add to subtask object
    subtaskResult.routeLength = calcRouteLength(weights, subtaskResult.route);

    resolve(subtaskResult);
  });
}

function sendObj(webSocket, type, data) {
  const obj = {
    type,
    data,
  };
  webSocket.send(JSON.stringify(obj));
}

// Function for printing result on website and sending result back to server
async function subtaskHandler(data, weights, webSocket) {
  await (calcRoute(data, weights))
    .then((result) => {
      sendObj(webSocket, 'result', result);
    })
    .catch((err) => { console.error(err); });
}

export { sendObj, subtaskHandler };
