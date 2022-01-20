onmessage = (message) => {
  console.log("Starting to parse file");
  console.time("fileParse");

  // ONLY allowed in worker
  const reader = new FileReaderSync();
  const fileContent = reader.readAsText(message.data);

  console.timeEnd("fileParse");
  console.log("Sending first 200 characters back");
  postMessage(fileContent.substring(0, 200));
};
