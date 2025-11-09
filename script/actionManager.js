
import { colCell, rowCell, canvas, ctx, borderColor, borderWidth } from "./elements.js";
import { drawGrid, reColorCells, setPaintedCells, getPaintedCells, colorCell } from "./drawing.js";
import { fixPaintedCellsSize, saveToLocalStorage, setCleanCellGrid } from "./storageManager.js";
import { getIsPickingColor, setIsPickingColor, addToRecentColors, eyedropperBtn } from "./colorBar.js";
import { penColor } from './elements.js';

//resets drawings
export function reset() {
    setPaintedCells([]);
    borderColor.value = "#000000";
    borderWidth.value = 1;
    setCleanCellGrid(getRowCount(), getColCount());
    resizePage();
}

function getRowCount() {
    return Math.max(1, Math.min(Number(rowCell.value), 500));
}

function getColCount() {
    return Math.max(1, Math.min(Number(colCell.value), 500));
}

let cellSize = null;

let first = true;
export function resizePage() {
    const baseDpr = window.devicePixelRatio || 1;
    const smoothening = 2; // for smoother canvas
    const dpr = Math.ceil(baseDpr * smoothening);

    if (colCell.value > 500 || colCell.value < 1 || rowCell.value > 500 || rowCell.value < 1) {
        if (first) {
            first = false;
        } else {
            return;
        }
    } else {
        first = true;
    }

    // get cellsize
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    let maxHeight;
    if (viewportWidth < 640) {
        maxHeight = (viewportHeight * 0.5) / getRowCount(); // mobil
    } else {
        maxHeight = (viewportHeight * 0.85) / getRowCount(); // desktop / tablet
    }
    const maxWidth = (viewportWidth * 0.90) / getColCount();

    cellSize = Math.floor(Math.min(maxWidth, maxHeight));

    // set canvas size in CSS pixels
    canvas.style.width = `${cellSize * getColCount()}px`;
    canvas.style.height = `${cellSize * getRowCount()}px`;

    // set canvas resolution
    canvas.width = cellSize * getColCount() * dpr;
    canvas.height = cellSize * getRowCount() * dpr;

    // scale content to dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    drawGrid(getRowCount(), getColCount(), cellSize);

    fixPaintedCellsSize(getRowCount(), getColCount());

    reColorCells(cellSize);

    saveToLocalStorage();
}

//drag to draw
let isDragging = false;
let prevCell = {
    row: null,
    col: null,
};
let clearing = null;

document.addEventListener('mousedown', startDragging)

function startDragging(e) {
    isDragging = true;
    prevCell.row = null;
    prevCell.col = null;
    cellDragging(e);
}

document.addEventListener('mouseup', stopDragging)

function stopDragging() {
    isDragging = false;
    prevCell.row = null;
    prevCell.col = null;
    clearing = null;
    saveToLocalStorage();
}

canvas.addEventListener('mousemove', cellDragging);


function cellDragging(e) {
    //if not on canvas don't try to paint
    if (e.target !== canvas) return;

    //if mouse not down dont try to paint
    if (!isDragging) {
        return;
    }

    const canvasDetails = canvas.getBoundingClientRect();
    const x = e.clientX - canvasDetails.left;
    const y = e.clientY - canvasDetails.top;

    //which cell is that?
    let currentCell = {
        row: Math.floor(y / cellSize),
        col: Math.floor(x / cellSize),
    };

    //if same as before return
    if (currentCell.row == prevCell.row && prevCell.col == currentCell.col) {
        return;
    }

    prevCell.row = Math.floor(y / cellSize);
    prevCell.col = Math.floor(x / cellSize);

    const paintedCells = getPaintedCells();
    //if we are color picking
    if (getIsPickingColor()) {
        const pickedColor = paintedCells[currentCell.row][currentCell.col];
        penColor.value = pickedColor;

        setIsPickingColor(false);
        eyedropperBtn.classList.remove('bg-green-400');
        eyedropperBtn.classList.add('hover:bg-gray-300');
        stopDragging();
        return;
    }

    if (clearing === null && paintedCells[currentCell.row][currentCell.col] != "#ffffff" && paintedCells[currentCell.row][currentCell.col] == penColor.value) {
        clearing = true;
    } else if (clearing === null) {
        clearing = false;
    }

    const color = clearing ? "#ffffff" : penColor.value;
    if(!clearing) addToRecentColors(penColor.value);
    colorCell(cellSize, currentCell, color);
}