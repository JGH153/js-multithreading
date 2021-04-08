console.log("Hello from worker!");

// can spawn it's own worker
const myWorker = new Worker("../web-workers/simple-worker.js");
myWorker.postMessage("1");
