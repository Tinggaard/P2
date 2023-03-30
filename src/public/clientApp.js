/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
function addition(A) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const initialValue = 0;
      const sumWithInitial = A.reduce(
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
async function calcExp(data, webSocket) {
  await (addition(data.data))
    .then((result) => {
      console.log(result);
      const selector = document.querySelector('#calculation');
      selector.innerHTML += `Calculation received: ${data.data}, final calculation: ${result} <br>`;
      const resultObj = new Obj('result', result);
      webSocket.send(JSON.stringify(resultObj));
    })
    .catch((err) => { console.log(err); });
}

export { Obj, calcExp };
