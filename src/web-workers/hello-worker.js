console.log("Hello from worker!");

// not allowed, no error
const myWorker = new Worker("web-workers/simple-worker.js");
myWorker.postMessage("1");
