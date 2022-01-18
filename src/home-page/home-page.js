import html from "./home-page.html";
import css from "./home-page.css";
import { setupShadow, inlineWorker } from "../helpers";
import { Pages } from "../models/Pages";

export class HomePage extends HTMLElement {
  constructor() {
    super();
    setupShadow(this, html, css);
  }

  connectedCallback() {
    console.log("online!");
  }

  disconnectedCallback() {}

  simpleWorker() {
    const myWorker = new Worker("web-workers/simple-worker.js");
    console.log(myWorker);
  }

  workerMessaging() {
    const myWorker = new Worker("web-workers/reply-worker.js");
    myWorker.onmessage = (message) => {
      console.log("Main thread got message", message);
    };
    myWorker.postMessage("Hello");
  }

  workerWorker() {
    new Worker("web-workers/hello-worker.js");
  }

  blockMainThread() {
    console.time("blockMainThread");
    let num = 0;
    // a for/while loop leaves NO room for other elements
    for (let i = 0; i < 10 ** 8; i++) {
      num++;
      // num += Math.random();
    }
    console.log("SUM", num);
    console.timeEnd("blockMainThread");
  }

  blockMainThreadNoBP() {
    console.time("blockMainThreadNoBP");
    let num = 0;
    // a for/while loop leaves NO room for other elements
    for (let i = 0; i < 10 ** 8; i++) {
      Math.random() < 0.5 ? num-- : num++;
    }
    console.log("SUM", num);
    console.timeEnd("blockMainThreadNoBP");
  }

  startAsyncCalculation() {
    this.asyncCalculation(0, 0);
    console.time("asyncStart");
  }

  asyncCalculation(num, iterations) {
    if (iterations >= 200) {
      console.log("DONE!", num);
      console.timeEnd("asyncStart");
      return;
    }
    // sleeps for 1000 / 144 = 6,95ms
    // runs for 6.95ms * 200 = 1.390sec
    requestAnimationFrame(() => {
      Math.random() < 0.5 ? num-- : num++;
      this.asyncCalculation(num, iterations + 1);
    });
  }

  startThreading() {
    console.log("Starting all cores");

    let sum = 0;

    // no safari support
    for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
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
    }).then((result) => console.log("Result from inline worker is", result));
  }

  inlineWorkerFetchExample() {
    inlineWorker(() => {
      fetch("https://api.github.com/search/repositories?q=language:javascript&sort=stars&order=desc&per_page=100")
        .then((response) => response.json())
        .then((data) => postMessage(data));
    }).then((result) => console.log("Result from inline worker is", result));
  }

  workerReadFile() {
    // read-file-sync
  }

  gotoCanvasPage() {
    const event = new CustomEvent("ChangePage", { detail: Pages.Canvas });
    this.dispatchEvent(event);
  }
}
