console.log("Worker online");

onmessage = (message) => {
  console.log("worker got message!", message);
  postMessage(message.data);
};
