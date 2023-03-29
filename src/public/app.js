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
      selector.innerHTML += `Calculation received: ${data.data}, final calculation: ${result}`;
      const resultObj = new Obj('result', result);
      webSocket.send(JSON.stringify(resultObj));
    })
    .catch((err) => { console.log(err); });
}

// Assigning tasks to clients if there are available tasks
function assignTask(subTasks, webSocket) {
  const A = subTasks.pop();
  const calcMessage = new Obj('calc', A);
  webSocket.send(JSON.stringify(calcMessage));
  // if (taskNumber !== allTasks.length) {
  //   const A = allTasks[taskNumber];
  //   const calcMessage = new Obj('calc', A);
  //   webSocket.send(JSON.stringify(calcMessage));
  //   const incTaskNum = taskNumber + 1;
  //   return incTaskNum;
  // }
  // return taskNumber;
}

/** Swaps 2 elements
 * @param {array} array The array where
 * @param {number} index1 Index of the first element
 * @param {number} index2 Index of the first element
 */
function swapElements(array, index1, index2) {
  const temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;
}

/** Returns the next combination of the subtask
* @param {number} TSPnodes The total number of nodes used
* @param {number} subtaskLength Number of elements in the subtask
* @param {arrray} currCombination The current combination - used to create the next combination
*/
function nextCombination(currCombination, TSPnodes, subtaskLength) {
  let i = subtaskLength - 1;
  while (i >= 0) {
    if (currCombination[i] === TSPnodes - (subtaskLength - i)) {
      i--;
    } else {
      currCombination[i] += 1;
      for (let j = i + 1; j < subtaskLength; j++) {
        currCombination[j] = currCombination[j - 1] + 1;
      }
      return currCombination.slice();
    }
  }
  console.log('TSP problem solved'); // If there are no more combinations (!!!LINJE SKAL ÆNDRES!!!)
  return null;
}

/** A modified version of Heaps algorithm that finds perms until we have the desired amount
* @param {array} currPerm - The current permutation used to find the next permutation
* @param {number} subtaskLength - Number of elements in the subtask
* @param {array} c - An array used for generating perms in heaps algoritm
* @param {number} TSPnodes - Number of destinations we need to visit (is also the full task)
* @param {number} amount - Desired amount of perms
* @returns {Array} - An array of perms of
*/

function nextPermutation(currPerm, subtaskLength, c, i, currCombination, TSPnodes, amount) {
  const result = []; // Array to hold the perms

  while (result.length < amount) { // Loop until the desired amount is reached
    if (i < subtaskLength) {
      // Generate the next permutation of the current array
      if (c[i] < i) {
        if (!(i % 2)) {
          swapElements(currPerm, 0, i);
        } else {
          swapElements(currPerm, c[i], i);
        }
        result.push(currPerm.slice()); // Add the new permutation to the result array
        c[i]++;
        i = 0;
      } else {
        c[i] = 0;
        i++;
      }
    } else { // When there are no more perms for the current combination
      // Generate the next combination
      currPerm = nextCombination(currCombination, TSPnodes, subtaskLength);
      if (currPerm === null) { // If there are no more combinations, return the result array
        return [result, i];
      }
      result.push(currPerm.slice()); // Add the new combination to the result array
      c = c.fill(0);
      i = 0;
    }
  }
  return [result, i];
}

// laver array [1, 2, ..., n] (fatter ikke helt
// const currCombination = Array.from({ length: 4 }, (_, i) => i + 1); // !!!konstant? (eslint) !!!
// const TSPnodes = 10;
// let currPerm = currCombination.slice();
// const c = new Array(currPerm.length).fill(0);
// let i = 0;

// let perms;
// [perms, i] = nextPermutation(currPerm, currPerm.length, c, i, currCombination, TSPnodes, 20);
// console.log(perms);
// currPerm = perms[perms.length - 1];

// [perms, i] = nextPermutation(currPerm, currPerm.length, c, i, currCombination, TSPnodes, 5);
// console.log(perms);

// Exports the functions for use in other files
export {
  Obj, calcExp, assignTask, nextCombination, nextPermutation, swapElements,
};
