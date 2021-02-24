export class EdgeDetectorService {
  static #instance;

  #width = 0;

  constructor() {
    // can return existing element in constructor to switch to that
    if (EdgeDetectorService.#instance) {
      return EdgeDetectorService.#instance;
    }
    EdgeDetectorService.#instance = this;
  }

  getEdgeImageMainTread(imgData, startX, startY, width, height, edgeThreshold) {
    this.#width = width;
    // TODO copy of data to perserve originale values
    const imgDataOriginal = imgData.slice(0);
    for (let y = startY; y < height; y++) {
      for (let x = startX; x < width; x++) {
        if (this.isPixelAtEdge(imgDataOriginal, x, y, edgeThreshold)) {
          this.setPixelColor(imgData, x, y, 255, 255, 255);
        } else {
          this.setPixelColor(imgData, x, y, 0, 0, 0);
        }
      }
    }

    const imageDataCopy = new ImageData(
      new Uint8ClampedArray(imgData),
      width,
      height
    );

    return imageDataCopy;
  }

  getEdgeImageWebWorker(imgData, width, height, edgeThreshold) {
    this.#width = width;

    return new Promise((resolve, reject) => {
      let workersReturned = 0;
      const workersTotal = 2;
      for (let i = 0; i < workersTotal; i++) {
        const myWorker = new Worker("web-workers/edge-worker.js");
        const dataToSend = {
          imgData,
          startX: i === 0 ? 0 : width / 2,
          startY: 0,
          width,
          height,
          workWidth: width,
          workHeight: height,
          edgeThreshold,
        };
        myWorker.postMessage(dataToSend);
        myWorker.onmessage = (message) => {
          // console.log("returning message main", message.data);
          workersReturned++;
          if (workersReturned === workersTotal) {
            const imageDataCopy = new ImageData(
              new Uint8ClampedArray(message.data.imgData),
              width,
              height
            );

            resolve(imageDataCopy);
          }
        };
      }
    });
  }

  isPixelAtEdge(data, x, y, edgeThreshold) {
    const hEdge =
      this.getPixelGreyValue(data, x - 1, y - 1) * -1 +
      this.getPixelGreyValue(data, x - 1, y) * -2 +
      this.getPixelGreyValue(data, x - 1, y + 1) * -1 +
      this.getPixelGreyValue(data, x + 1, y - 1) * 1 +
      this.getPixelGreyValue(data, x + 1, y) * 2 +
      this.getPixelGreyValue(data, x + 1, y + 1) * 1;

    const vEdge =
      this.getPixelGreyValue(data, x - 1, y - 1) * -1 +
      this.getPixelGreyValue(data, x, y - 1) * -2 +
      this.getPixelGreyValue(data, x + 1, y - 1) * -1 +
      this.getPixelGreyValue(data, x - 1, y + 1) * 1 +
      this.getPixelGreyValue(data, x, y + 1) * 2 +
      this.getPixelGreyValue(data, x + 1, y + 1) * 1;

    const edginess = Math.sqrt(hEdge * hEdge + vEdge * vEdge);
    const threshold = edgeThreshold;

    return edginess > threshold;
  }

  getPixelGreyValue(data, x, y) {
    const index = (x + y * this.#width) * 4;
    const greycolor = (data[index] + data[index + 1] + data[index + 2]) / 3;
    return greycolor;
  }

  getPixelColor(data, x, y) {
    const index = (x + y * this.#width) * 4;
    return this.getPixelColorAtIndex(data, index);
  }

  getPixelColorAtIndex(data, index) {
    return {
      red: data[index],
      green: data[index + 1],
      blue: data[index + 2],
      alpha: data[index + 3],
    };
  }

  setPixelColor(data, x, y, red, green, blue, alpha = 255) {
    const index = (x + y * this.#width) * 4;
    return this.setPixelColorAtIndex(data, index, red, green, blue, alpha);
  }

  setPixelColorAtIndex(data, index, red, green, blue, alpha = 255) {
    data[index] = red;
    data[index + 1] = green;
    data[index + 2] = blue;
    data[index + 3] = alpha;
  }
}
