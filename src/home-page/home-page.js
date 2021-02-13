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

    for (let i = 0; i < 20; i++) {
      const myWorker = new Worker("web-workers/high-cpu-example.js");

      myWorker.onmessage = (message) => {
        // console.log("recived message", message);
        sum += message.data;
        console.log("new sum", sum);
      };

      // myWorker.postMessage("Hello");
    }
  }
}
