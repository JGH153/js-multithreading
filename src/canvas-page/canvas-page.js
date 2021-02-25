import html from "./canvas-page.html";
import css from "./canvas-page.css";
import { setupShadow, inlineWorker } from "../helpers";
import { EdgeDetectorService } from "../services/edge-detector.service";

// https://github.com/JGH153/webrtc/tree/master/angular/src/app/image-manipulation
export class CanvasPage extends HTMLElement {
  data;
  imageData;
  originalImageData;
  ctx;
  edgeThreshold = 100;
  #edgeDetectorService = new EdgeDetectorService();

  constructor() {
    super();
    setupShadow(this, html, css);
  }

  connectedCallback() {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = "assets/pondus.jpg";
    img.onload = () => {
      this.draw(img);
    };
  }

  draw(img) {
    const canvas = this.shadowRoot.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
    this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.style.display = "none";
    this.imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.data = this.imageData.data;
    this.originalImageData = this.data.slice(0);
  }

  disconnectedCallback() {}

  greyscale() {
    console.log("grey!");
    for (let i = 0; i < this.data.length; i += 4) {
      const avg = (this.data[i] + this.data[i + 1] + this.data[i + 2]) / 3;
      this.data[i] = avg; // red
      this.data[i + 1] = avg; // green
      this.data[i + 2] = avg; // blue
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  invert() {
    console.log("invert");
    for (let i = 0; i < this.data.length; i += 4) {
      this.data[i] = 255 - this.data[i]; // red
      this.data[i + 1] = 255 - this.data[i + 1]; // green
      this.data[i + 2] = 255 - this.data[i + 2]; // blue
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  pixelateImage() {
    const dataCopy = this.data.slice(0);
    for (let i = 0; i < this.data.length; i += 4 * 2) {
      const targetPixelIndex = i - 4;
      if (i < 0) {
        continue;
      }
      this.data[i] = dataCopy[targetPixelIndex]; // red
      this.data[i + 1] = dataCopy[targetPixelIndex + 1]; // green
      this.data[i + 2] = dataCopy[targetPixelIndex + 2]; // blue
      // this.data[i + 3] = 100; // alpha
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  edgeImage() {
    console.time("edgeWork");
    const canvas = this.shadowRoot.getElementById("canvas");
    const imgData = this.originalImageData.slice(0); // make copy
    const edgeData = this.#edgeDetectorService.getEdgeImageMainTread(
      imgData,
      0,
      0,
      canvas.width,
      canvas.height,
      this.edgeThreshold
    );

    this.ctx.putImageData(edgeData, 0, 0);
    console.timeEnd("edgeWork");
  }

  edgeImageWebWorker() {
    console.time("edgeWorkWW");
    const canvas = this.shadowRoot.getElementById("canvas");
    const imgData = this.originalImageData.slice(0); // make copy
    this.#edgeDetectorService
      .getEdgeImageWebWorker(
        imgData,
        canvas.width,
        canvas.height,
        this.edgeThreshold
      )
      .then((edgeData) => {
        this.ctx.putImageData(edgeData, 0, 0);
        console.timeEnd("edgeWorkWW");
      });
  }
}
