let myId = undefined;

const bc = new BroadcastChannel("worker-bc");

bc.onmessage = (message) => {
  console.log("BC message in worker", myId, "with message", message.data);
};

onmessage = (message) => {
  myId = message.data;
  console.log("Worker got message and is online with ID:", myId);
  if (myId === 3) {
    // last worker send broadcast channel message to all workers
    console.log("Sending BC message");
    bc.postMessage("42");
  }
};
