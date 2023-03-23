function addition(A) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let answer = A[0]+A[1];
      resolve(answer)
    }, 2000);
  });
}

export default addition;
