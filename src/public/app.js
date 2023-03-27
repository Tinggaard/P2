function addition(A) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const answer = A[0] + A[1];
      resolve(answer);
    }, 5000);
  });
}

export default addition;
