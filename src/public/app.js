function addition(A) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const answer = A[0] + A[1];
      resolve(answer);
    }, 1000);
  });
}

function Obj(type, data) {
  this.type = type;
  this.data = data;
}

async function calcExp(data, webSocket) {
  await (addition(data.data))
    .then((result) => {
      console.log(result);
      const selector = document.querySelector('#calculation');
      selector.innerHTML = `Calculation received: ${data.data}, final calculation: ${result}`;
      const resultObj = new Obj('result', result);
      webSocket.send(JSON.stringify(resultObj));
      console.log('hej');
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

export { Obj, calcExp, assignTask };
