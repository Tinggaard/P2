function Obj(type, data) {
  this.type = type;
  this.data = data;
}

function factorial(num) {
  let result = 1;
  for (let i = 2; i < num; i++) {
    result *= i;
  }
  return result;
}

function sendObj(webSocket, type, data) {
  const obj = new Obj(type, data);
  webSocket.send(JSON.stringify(obj));
}

// class keeping track of the main task, and iterating combinations/permutations
class Task {
  constructor(vertexCount, weights, fileName) {
    this.name = fileName;
    this.vertexCount = vertexCount; // amount of nodes
    this.nodes = Array.from(Array(vertexCount).keys()).slice(1); // array from 1 -> n-1
    this.weights = weights; // matrix of weights
    // Make sure the clients don't have to calculate too much
    if (vertexCount > 13) {
      this.fixedPathLength = vertexCount - 11;
    } else {
      this.fixedPathLength = 2;
    }
    this.currCombination = this.nodes.slice(0, this.fixedPathLength); // init combination
    this.currPermutation = this.currCombination.slice(); // copy of the above
    this.unfinished = []; // array of unfinished task from DC'ed clients
    this.shortestPath = []; // permutation of shortest path
    this.shortestSum = Infinity; // sum of above permutation
    this.iterator = this.getNextCombination();
    this.subtaskAmount = this.calcTotalSubtasks();
  }

  calcTotalSubtasks() {
    return factorial(this.vertexCount) / factorial(this.vertexCount - this.fixedPathLength);
  }

  swapElements(index1, index2) {
    const temp = this.currPermutation[index1];
    this.currPermutation[index1] = this.currPermutation[index2];
    this.currPermutation[index2] = temp;
  }

  // Heap's Algorithm
  * getNextPermutation(k) {
    if (this.unfinished.length !== 0) { // if we have previously unfinished tasks
      yield this.unfinished.pop(0); // get first element
    }
    if (k === 1) { // base case
      yield this.currPermutation;
    } else {
      yield* this.getNextPermutation(k - 1, this.currPermutation);
      for (let i = 0; i < k - 1; i++) {
        if (k % 2 === 0) { // k is even
          this.swapElements(i, k - 1);
        } else {
          this.swapElements(0, k - 1);
        }
        yield* this.getNextPermutation(k - 1, this.currPermutation);
      }
    }
  }

  * getNextCombination() {
    let i = this.fixedPathLength - 1; // current index we change
    // yield the first iteration
    yield* this.getNextPermutation(this.fixedPathLength, this.currPermutation);

    while (i >= 0) {
      // check if current index is at max value
      if (this.currCombination[i] === (this.vertexCount) - (this.fixedPathLength - i)) {
        i--;
      } else { // increment i by 1 and let all previous nodes be 1 larger
        this.currCombination[i] += 1;
        for (let j = i + 1; j < this.fixedPathLength; j++) {
          this.currCombination[j] = this.currCombination[j - 1] + 1;
        }
        // copy combination into premutation
        this.currPermutation = this.currCombination.slice();
        yield* this.getNextPermutation(this.fixedPathLength, this.currPermutation);
        i = this.fixedPathLength - 1;
      }
    }
  }
}

export {
  Obj, Task, sendObj,
};
