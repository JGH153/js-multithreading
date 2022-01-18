import html from "./canvas-page.html";
import css from "./canvas-page.css";
import { setupShadow, inlineWorker } from "../helpers";
import { EdgeDetectorService } from "../services/edge-detector.service";

export class CanvasPage extends HTMLElement {
  data;
  imageData;
  originalImageData;
  ctx;
  edgeThreshold = 10;
  #edgeDetectorService = new EdgeDetectorService();
  currentPondus = 0;
  maxPondus = 6;
  spinnerVisible = false;
  runLoops = false;

  constructor() {
    super();
    setupShadow(this, html, css);
  }

  spinner() {
    this.spinnerVisible = !this.spinnerVisible;
    const element = this.shadowRoot.getElementById("spinner");
    if (this.spinnerVisible) {
      element.style = "display: block";
    } else {
      element.style = "display: none";
    }
  }

  renderNewPondus() {
    // in case slow rendering loop is running
    requestAnimationFrame(() => {
      this.runLoops = false;
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = "assets/pondus" + this.currentPondus + ".jpg";
      img.onload = () => {
        this.draw(img);
      };
    });
  }

  reRender() {
    requestAnimationFrame(() => {
      this.runLoops = false;
      const canvas = this.shadowRoot.getElementById("canvas");
      const imageData = new ImageData(new Uint8ClampedArray(this.originalImageData), canvas.width, canvas.height);
      this.ctx.putImageData(imageData, 0, 0);
    });
  }

  connectedCallback() {
    this.renderNewPondus();
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

  changeImage() {
    this.currentPondus++;
    if (this.currentPondus > this.maxPondus) {
      this.currentPondus = 0;
    }
    this.renderNewPondus();
  }

  greyScale() {
    for (let i = 0; i < this.data.length; i += 4) {
      const avg = (this.data[i] + this.data[i + 1] + this.data[i + 2]) / 3;
      this.data[i] = avg; // red
      this.data[i + 1] = avg; // green
      this.data[i + 2] = avg; // blue
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  greyAndColorScale() {
    const limit = 115;
    for (let i = 0; i < this.data.length; i += 4) {
      if (this.data[i + 2] > limit) {
        continue;
      }
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
      .getEdgeImageWebWorker(imgData, canvas.width, canvas.height, this.edgeThreshold)
      .then((edgeData) => {
        this.ctx.putImageData(edgeData, 0, 0);
        console.timeEnd("edgeWorkWW");
      });
  }

  startEdgeLoop() {
    console.time("edgeLoop");
    this.runLoops = true;
    this.edgeLoop(0, 5, 100);
  }

  edgeLoop(currentThreshold, step, endThreshold) {
    console.time("edgeWork");
    const canvas = this.shadowRoot.getElementById("canvas");
    const imgData = this.originalImageData.slice(0); // make copy
    const edgeData = this.#edgeDetectorService.getEdgeImageMainTread(
      imgData,
      0,
      0,
      canvas.width,
      canvas.height,
      currentThreshold
    );

    this.ctx.putImageData(edgeData, 0, 0);
    console.timeEnd("edgeWork");
    currentThreshold += step;
    if (currentThreshold <= endThreshold && this.runLoops) {
      requestAnimationFrame(() => {
        this.edgeLoop(currentThreshold, step, endThreshold);
      });
    } else {
      console.log("Done");
      console.timeEnd("edgeLoop");
    }
  }

  startEdgeWWLoop() {
    console.time("edgeWWLoop");
    this.runLoops = true;
    this.edgeWWLoop(0, 1, 100);
  }

  edgeWWLoop(currentThreshold, step, endThreshold) {
    const canvas = this.shadowRoot.getElementById("canvas");
    const imgData = this.originalImageData.slice(0); // make copy
    this.#edgeDetectorService
      .getEdgeImageWebWorker(imgData, canvas.width, canvas.height, currentThreshold)
      .then((edgeData) => {
        this.ctx.putImageData(edgeData, 0, 0);
        currentThreshold += step;
        if (currentThreshold <= endThreshold && this.runLoops) {
          requestAnimationFrame(() => {
            this.edgeWWLoop(currentThreshold, step, endThreshold);
          });
        } else {
          console.log("Done");
          console.timeEnd("edgeWWLoop");
        }
      });
  }
}
