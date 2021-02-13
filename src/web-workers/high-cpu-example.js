console.log("Worker online");

onmessage = (message) => {
  console.log("worker got message!0", message);
};

const result = flipCoins(1000000000); // 1 bil?
console.log(result);
postMessage(result);

function flipCoins(iterations) {
  let num = 0;
  for (let i = 0; i < iterations; i++) {
    if (Math.random() < 0.5) {
      num--;
    } else {
      num++;
    }
  }
  return num;
}
