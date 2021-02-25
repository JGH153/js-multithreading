// post message with image data, start x, end x, start y, end y

let elementWidth = 0;

onmessage = (message) => {
  // console.log("worker got message!0", message.data);

  detectAndReturnEdges(
    message.data.imgData,
    message.data.startX,
    message.data.startY,
    message.data.width,
    message.data.height,
    message.data.workWidth,
    message.data.workHeight,
    message.data.edgeThreshold
  );
};

const detectAndReturnEdges = (
  imgData,
  startX,
  startY,
  width,
  height,
  workWidth,
  workHeight,
  edgeThreshold
) => {
  elementWidth = width;
  // TODO copy of data to perserve originale values
  const imgDataOriginal = imgData.slice(0);
  for (let y = startY; y < startY + workHeight; y++) {
    for (let x = startX; x < startX + workWidth; x++) {
      if (isPixelAtEdge(imgDataOriginal, x, y, edgeThreshold)) {
        setPixelColor(imgData, x, y, 255, 255, 255);
      } else {
        setPixelColor(imgData, x, y, 0, 0, 0);
      }
    }
  }

  const response = {
    imgData,
    startX,
    startY,
    width,
    height,
    endWidth: startX + workWidth,
    endHeight: startY + workHeight,
  };

  postMessage(response);
};

const isPixelAtEdge = (data, x, y, edgeThreshold) => {
  const hEdge =
    getPixelGreyValue(data, x - 1, y - 1) * -1 +
    getPixelGreyValue(data, x - 1, y) * -2 +
    getPixelGreyValue(data, x - 1, y + 1) * -1 +
    getPixelGreyValue(data, x + 1, y - 1) * 1 +
    getPixelGreyValue(data, x + 1, y) * 2 +
    getPixelGreyValue(data, x + 1, y + 1) * 1;

  const vEdge =
    getPixelGreyValue(data, x - 1, y - 1) * -1 +
    getPixelGreyValue(data, x, y - 1) * -2 +
    getPixelGreyValue(data, x + 1, y - 1) * -1 +
    getPixelGreyValue(data, x - 1, y + 1) * 1 +
    getPixelGreyValue(data, x, y + 1) * 2 +
    getPixelGreyValue(data, x + 1, y + 1) * 1;

  const edginess = Math.sqrt(hEdge * hEdge + vEdge * vEdge);
  const threshold = edgeThreshold;

  return edginess > threshold;
};

const getPixelGreyValue = (data, x, y) => {
  const index = (x + y * elementWidth) * 4;
  const greycolor = (data[index] + data[index + 1] + data[index + 2]) / 3;
  return greycolor;
};

const getPixelColor = (data, x, y) => {
  const index = (x + y * elementWidth) * 4;
  return getPixelColorAtIndex(data, index);
};

const getPixelColorAtIndex = (data, index) => {
  return {
    red: data[index],
    green: data[index + 1],
    blue: data[index + 2],
    alpha: data[index + 3],
  };
};

const setPixelColor = (data, x, y, red, green, blue, alpha = 255) => {
  const index = (x + y * elementWidth) * 4;
  return setPixelColorAtIndex(data, index, red, green, blue, alpha);
};

const setPixelColorAtIndex = (data, index, red, green, blue, alpha = 255) => {
  data[index] = red;
  data[index + 1] = green;
  data[index + 2] = blue;
  data[index + 3] = alpha;
};
