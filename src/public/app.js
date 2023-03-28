function addition(A) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const answer = A[0] + A[1];
      resolve(answer);
    }, 5000);
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
      selector.innerHTML = `Calculation received: ${data.data}, final calculation: ${result}`;
      const resultObj = new Obj('result', result);
      webSocket.send(JSON.stringify(resultObj));
    })
    .catch((err) => { console.log(err); });
}

// Assigning tasks to clients if there are available tasks
function assignTask(allTasks, taskNumber, webSocket) {
  if (taskNumber !== allTasks.length) {
    const A = allTasks[taskNumber];
    const calcMessage = new Obj('calc', A);
    webSocket.send(JSON.stringify(calcMessage));
    const incTaskNum = taskNumber + 1;
    return incTaskNum;
  }
  return taskNumber;
}

// Exports the functions for use in other files
export { Obj, calcExp, assignTask };
