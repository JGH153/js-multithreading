import html from "./home-page.html";
import css from "./home-page.css";
import { setupShadow, inlineWorker } from "../helpers";

export class HomePage extends HTMLElement {
  constructor() {
    super();
    setupShadow(this, html, css);
  }

  connectedCallback() {
    console.log("online!");
  }

  disconnectedCallback() {}

  workerWorker() {
    const myWorker = new Worker("web-workers/hello-worker.js");
    console.log(myWorker);
  }

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

  inlineWorkerExample() {
    inlineWorker(() => {
      let num = 0;
      for (let i = 0; i < 10 ** 8; i++) {
        Math.random() < 0.5 ? num-- : num++;
      }
      return num;
    }).then((result) => console.log("Result is", result));
  }

  inlineWorkerFetchExample() {
    inlineWorker(() => {
      fetch(
        "https://api.github.com/search/repositories?q=language:javascript&sort=stars&order=desc&per_page=100"
      )
        .then((response) => response.json())
        .then((data) => postMessage(data));
    }).then((result) => console.log("Result is", result));
  }
}
