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
