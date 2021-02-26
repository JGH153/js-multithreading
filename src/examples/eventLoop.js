// just one core, one thing at a time
// JS is event based and this is hwo

taskQueue.push(mainScript); // the first code that runs
while (true) {
  // should do 60 or more loops a second

  updateBrowserUi(); // Make UI respond
  taskQueue.forEach((element) => {
    element.runJavascriptStack(); // like mouse click, setTimeout, update animation and fetch
  });
  onNewEvents = (event) => taskQueue.push(event); // like http returns, user click button and setTimeout is done
  sleepToNextFrame(); // based on screen refresh rate. 60Hz -> 1000ms / 60Hz = 16.67ms
}
