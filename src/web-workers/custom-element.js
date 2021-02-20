// importScripts("https://cdn.jsdelivr.net/npm/jsdom@16.4.0/lib/api.min.js"); :(

class WorkerTest extends HTMLElement {
  constructor() {
    super();
    // setupShadow(this, html, css);
  }

  connectedCallback() {
    console.log("online!");
  }

  disconnectedCallback() {}
}

customElements.define("worker-test", WorkerTest);
