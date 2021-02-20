console.log("Worker online");

onmessage = (message) => {
  console.log("worker got message!0", message);
};

// Chrome will compile this down to machine code as it is requested so often
// so little benefit from doing it with Web assembly
function flipCoins(iterations) {
  let num = 0;
  for (let i = 0; i < iterations; i++) {
    // Decreasing odds will make branch prediction speed up execution. from ca 23 down to ca 18
    if (Math.random() < 0.5) {
      num--;
    } else {
      num++;
    }
  }
  return num;
}

const result = flipCoins(10 ** 9); // 1 bil?
postMessage(result);
close();
