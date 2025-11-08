import { resizePage, reset } from './actionManager.js';
import { load, copyCanvasToClipboard } from './storageManager.js';
import './colorBar.js';
import './drawing.js';
import { rowCell, colCell, borderWidth, borderColor } from './elements.js';

const resetBtn = document.querySelector("#resetBtn");
const copyBtn = document.querySelector("#copyBtn");

// Event listeners

let resizeTimeoutInput;

function debounceResize() {
    clearTimeout(resizeTimeoutInput);
    resizeTimeoutInput = setTimeout(resizePage, 500);
}
rowCell.addEventListener("input", debounceResize);
colCell.addEventListener("input", debounceResize);

borderWidth.addEventListener("input", resizePage);
borderColor.addEventListener("input", resizePage);
resetBtn.addEventListener('click', reset);
copyBtn.addEventListener('click', copyCanvasToClipboard);

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizePage, 100);
});

// load saved data / setup
load();
