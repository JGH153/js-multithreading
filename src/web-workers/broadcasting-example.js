let myId = undefined;

const bc = new BroadcastChannel("worker-bc");

bc.onmessage = (message) => {
  console.log("BC message in worker", myId, "with message", message.data);
};

onmessage = (message) => {
  myId = message.data;
  console.log("worker got message and is online", myId);
  if (myId === 3) {
    // last worker
    console.log("Sending BC message");
    bc.postMessage("42");
  }
};
