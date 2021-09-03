/* fetching references of all nodes in the DOM */
const activeToolEl = document.getElementById("active-tool");
const brushColorBtn = document.getElementById("brush-color");
const brushIcon = document.getElementById("brush");
const brushSize = document.getElementById("brush-size");
const brushSlider = document.getElementById("brush-slider");
const backgroundColor = document.getElementById("background-color");
const eraser = document.getElementById("eraser");
const clearCanvasBtn = document.getElementById("clear-canvas");
const saveStorageBtn = document.getElementById("save-storage");
const loadStorageBtn = document.getElementById("load-storage");
const clearStorageBtn = document.getElementById("clear-storage");
const downloadBtn = document.getElementById("download");
const { body } = document;
const BRUSH_SWITCH_TIME = 1500;

/////////////////////////////////////// Global Variables//////////////////////////////////////////

/* setting up canvas */
const canvas = document.createElement("canvas");
canvas.id = "canvas";

/* create context for 2d graphics */
const context = canvas.getContext("2d");

let currentSize = 10;
/* store value of color for background */
let bgColor = "#FFFFFF";
/* store value of color for brush */
let currentColor = "#A51DAB";
let isEraser = false;
let isMouseDown = false;
let drawnArray = [];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Formatting Brush Size
function displayBrushSize() {
  if (brushSlider.value < 10) {
    brushSize.textContent = `0${brushSlider.value}`;
  } else {
    brushSize.textContent = brushSlider.value;
  }
}

// Setting Brush Size
brushSlider.addEventListener("change", () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

// Setting Brush Color
brushColorBtn.addEventListener("change", () => {
  isEraser = false;
  currentColor = `#${brushColorBtn.value}`;
});

// Setting Background Color
backgroundColor.addEventListener("change", () => {
  bgColor = `#${backgroundColor.value}`;
  createCanvas();
  restoreCanvas();
});

// // Eraser
eraser.addEventListener("click", () => {
  isEraser = true;
  brushIcon.style.color = "white";
  eraser.style.color = "black";
  activeToolEl.textContent = "Eraser";
  currentColor = bgColor;
  currentSize = 50;
});

//Switch back to Brush
function switchToBrush() {
  isEraser = false;
  activeToolEl.textContent = "Brush";
  brushIcon.style.color = "black";
  eraser.style.color = "white";
  currentColor = `#${brushColorBtn.value}`;
  currentSize = 10;
  /* default value of brush size when brush icon is clicked */
  brushSlider.value = 10;
  displayBrushSize();
}

function brushTimeSetTimeout(ms) {
  setTimeout(switchToBrush,ms);
}

// Create Canvas
function createCanvas() {
  /* width of canvas is window width */
  canvas.width = window.innerWidth;
  /* height of canvas is window height minus toolbar height*/
  canvas.height = window.innerHeight - 50;
  /* reactangle background color */
  context.fillStyle = bgColor;
  /* rectangle banana , ar uski width ar height window ki width ar height ke barabar kardena*/
  context.fillRect(0, 0, canvas.width, canvas.height);
  /* canvas element ko body element ka child bna rahe h,dom mein dalne ka kaam */
  body.appendChild(canvas);
  switchToBrush();
}

// Clear Canvas
clearCanvasBtn.addEventListener("click", () => {
  createCanvas();
  drawnArray = [];
  // Active Tool
  activeToolEl.textContent = "Canvas Cleared";
  brushTimeSetTimeout(BRUSH_SWITCH_TIME);
});

// Draw what is stored in DrawnArray
function restoreCanvas() {
  for (let i = 1; i < drawnArray.length; i++) {
    /* create a path */
    context.beginPath();
    /* moves starting point of path in x,y coordinate to new sub path */
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    /* width of line to draw on path*/
    context.lineWidth = drawnArray[i].size;
    /* shape of line -> round/square */
    context.lineCap = "round";
    if (drawnArray[i].eraser) {
      /* for creating erasing effect eraser color is same as background color*/
      context.strokeStyle = bgColor;
    } else {
      /* line color same as brush color */
      context.strokeStyle = drawnArray[i].color;
    }
    /*  Connects the last point in the current sub-path to the specified (x, y) coordinates with a straight line. */
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    /* finally draws the line with given color */
    context.stroke();
  }
}

// Store Drawn Lines in DrawnArray
function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };
  drawnArray.push(line);
}

// // Get Mouse Position
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

// // Mouse Down
canvas.addEventListener("mousedown", (event) => {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);
  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
  context.lineWidth = currentSize;
  context.lineCap = "round";
  context.strokeStyle = currentColor;
});

// // Mouse Move
canvas.addEventListener("mousemove", (event) => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser
    );
  } else {
    storeDrawn(undefined);
  }
});

// // Mouse Up
canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

// // Save to Local Storage
saveStorageBtn.addEventListener("click", () => {
  localStorage.setItem("savedCanvas", JSON.stringify(drawnArray));
  // Active Tool
  activeToolEl.textContent = "Canvas Saved";
  brushTimeSetTimeout(BRUSH_SWITCH_TIME)});

// // Load from Local Storage
loadStorageBtn.addEventListener("click", () => {
  if (localStorage.getItem("savedCanvas")) {
    drawnArray = JSON.parse(localStorage.savedCanvas);
    restoreCanvas();
    // Active Tool
    activeToolEl.textContent = "Canvas Loaded";
    brushTimeSetTimeout(BRUSH_SWITCH_TIME)  } else {
    activeToolEl.textContent = "No Canvas Found";
    brushTimeSetTimeout(BRUSH_SWITCH_TIME)  }
});

// Clear Local Storage
clearStorageBtn.addEventListener("click", () => {
  localStorage.removeItem("savedCanvas");
  // Active Tool
  activeToolEl.textContent = "Local Storage Cleared";
  brushTimeSetTimeout(BRUSH_SWITCH_TIME)});

// // Download Image
downloadBtn.addEventListener("click", () => {
  downloadBtn.href = canvas.toDataURL("image/jpeg", 1);
  downloadBtn.download = "canvas.jpeg";
  // Active Tool
  activeToolEl.textContent = "Image File Saved";
  brushTimeSetTimeout(BRUSH_SWITCH_TIME)});

// // Event Listener
brushIcon.addEventListener("click", switchToBrush);

// On Load
if (canvas.getContext) {
  createCanvas();
} else {
  alert("canvas is not supported\nPlease use lates browsers");
}
