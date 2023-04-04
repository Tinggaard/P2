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
