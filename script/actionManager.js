
import { colCell, rowCell, canvas, ctx } from "./elements.js";
import { drawGrid, reColorCells, setPaintedCells, getPaintedCells, colorCell } from "./drawing.js";
import { fixPaintedCellsSize, saveToLocalStorage, setCleanCellGrid } from "./storageManager.js";
import { getIsPickingColor, setIsPickingColor, addToRecentColors } from "./colorBar.js";
import { penColor } from './elements.js';

//resets drawings
export function reset() {
    setPaintedCells([]);
    setCleanCellGrid(getRowCount(), getColCount());
    resizePage();
}

function getRowCount() {
    return Math.max(1, Number(rowCell.value));
}

function getColCount() {
    return Math.max(1, Number(colCell.value));
}

let cellSize = null;

export function resizePage() {
    const baseDpr = window.devicePixelRatio || 1;
    const smoothening = 3; // for smoother canvas
    const dpr = baseDpr * smoothening;

    // get cellsize
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    let maxHeight;
    if (viewportWidth < 640) {
        maxHeight = (viewportHeight * 0.5) / getRowCount(); // mobil
    } else {
        maxHeight = (viewportHeight * 0.8) / getRowCount(); // desktop / tablet
    }
    const maxWidth = (viewportWidth * 0.8) / getColCount();
    cellSize = Math.min(maxWidth, maxHeight);

    // set canvas size in CSS pixels
    canvas.style.width = `${cellSize * getColCount()}px`;
    canvas.style.height = `${cellSize * getRowCount()}px`;

    // set canvas resolution
    canvas.width = cellSize * getColCount() * dpr;
    canvas.height = cellSize * getRowCount() * dpr;

    // scale content to dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    drawGrid(getRowCount(), getColCount(), cellSize);

    fixPaintedCellsSize(getRowCount(), getColCount());

    reColorCells(cellSize);

    saveToLocalStorage();
}

// detect cell click
function cellClicked(clickedCell) {
    const canvasDetails = canvas.getBoundingClientRect();
    const x = clickedCell.clientX - canvasDetails.left;
    const y = clickedCell.clientY - canvasDetails.top;

    //which cell is that?
    const currentCell = {
        row: Math.floor(y / cellSize),
        col: Math.floor(x / cellSize),
    };

    const paintedCells = getPaintedCells();
    //if we are color picking
    if (getIsPickingColor()) {
        const pickedColor = paintedCells[currentCell.row][currentCell.col].color || '#ffffff';
        penColor.value = pickedColor;

        setIsPickingColor(false);
        eyedropperBtn.classList.remove('bg-green-400');
        eyedropperBtn.classList.add('hover:bg-gray-300');
        return;
    }

    if (paintedCells[currentCell.row][currentCell.col].colored && paintedCells[currentCell.row][currentCell.col].color == penColor.value) {
        colorCell(cellSize, currentCell, "#ffffff", false);
    } else {
        colorCell(cellSize, currentCell, penColor.value);
        addToRecentColors(penColor.value);
    }
}
canvas.addEventListener('click', cellClicked);