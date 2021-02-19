import html from "./home-page.html";
import css from "./home-page.css";
import { setupShadow } from "../helpers";

export class HomePage extends HTMLElement {
  constructor() {
    super();
    setupShadow(this, html, css);
  }

  connectedCallback() {
    console.log("online!");
  }

  disconnectedCallback() {}

  startThreading() {
    console.log("yay");

    let sum = 0;

    for (let i = 0; i < 24; i++) {
      const timeLabel = "Thread" + i;
      console.time(timeLabel);
      const myWorker = new Worker("web-workers/high-cpu-example.js");

      myWorker.onmessage = (message) => {
        sum += message.data;
        console.log("new sum", sum);
        console.timeEnd(timeLabel);
      };
    }
  }

  startBroadcastThreads() {
    const bc = new BroadcastChannel("worker-bc");

    bc.onmessage = (message) => {
      console.log("Main thread message", message.data);
    };

    for (let i = 0; i < 4; i++) {
      const myWorker = new Worker("web-workers/broadcasting-example.js");
      myWorker.postMessage(i);
      myWorker.onmessage = (message) => {
        console.log("returning message main", message);
      };
    }
  }

  customElement() {
    const myWorker = new Worker("web-workers/custom-element.js");
    // myWorker.postMessage(HTMLElement); :(
    myWorker.onmessage = (message) => {
      console.log("returning message main", message);
    };
  }

  inlineWorker(func) {
    console.log(func);
    return new Promise((resolve, reject) => {
      // Build a worker from an anonymous function body
      const blobURL = URL.createObjectURL(
        new Blob(["(", func.toString(), ")()"], { // tod replace return with postMessage
          type: "application/javascript",
        })
      );
      const myWorker = new Worker(blobURL);
      myWorker.onmessage = (message) => {
        console.log("Return of", message.data);
        resolve(message.data);
      };

      // Won't be needing this anymore
      URL.revokeObjectURL(blobURL);
    });
  }

  inlineWorkerExample() {
    this.inlineWorker(() => {
      console.log("calculating");
      postMessage(2 + 2);
      return 1 + 1;
    }).then((result) => console.log("Result is", result));
  }
}
