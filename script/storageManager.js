import { rowCell, colCell, canvas, borderColor, borderWidth } from "./elements.js";
import { setPaintedCells, getPaintedCells } from "./drawing.js";
import { addToRecentColors, getRecentColors } from "./colorBar.js";
import { resizePage } from "./actionManager.js";

//load data from storage
export function load() {
    const row = Number(localStorage.getItem('row'));
    rowCell.value = row === 0 ? 5 : row;

    const col = Number(localStorage.getItem('col'));
    colCell.value = col === 0 ? 5 : col;

    const bw = Number(localStorage.getItem('borderWidth'));
    borderWidth.value = bw === 0 ? 1 : bw;

    borderColor.value = localStorage.getItem('borderColor') ?? "#000000";

    const savedCells = localStorage.getItem('paintedCells');
    if (savedCells && savedCells.startsWith('[')) {
        const paintedCells = JSON.parse(savedCells)
        if (paintedCells) {
            setPaintedCells(paintedCells);
        } else {
            setCleanCellGrid(Math.max(1, Number(rowCell.value)), Math.max(1, Number(colCell.value)));
        }
    } else {
        setPaintedCells([]);
        setCleanCellGrid(Math.max(1, Number(rowCell.value)), Math.max(1, Number(colCell.value)));
    }
    const savedRecent = localStorage.getItem('recentColors');
    if (savedRecent && savedRecent.startsWith('[')) {
        const colors = JSON.parse(savedRecent);
        colors.reverse().forEach(color => addToRecentColors(color));
    }
    resizePage();
}

//makes paintedCell
export function setCleanCellGrid(rowCount, colCount) {
    let cellGrid = [];
    for (let row = 0; row < rowCount; row++) {
        let currentRow = [];
        for (let col = 0; col < colCount; col++) {
            currentRow.push(
                "#ffffff"
            );
        }
        cellGrid.push(currentRow);
    }
    setPaintedCells(cellGrid);
}

//adds missing cols and rows to PaintedCells on expansion
export function fixPaintedCellsSize(rowCount, colCount) {
    let paintedCells = getPaintedCells();
    const currentRows = paintedCells.length;
    const currentCols = paintedCells[0] ? paintedCells[0].length : 0;

    // add missing rows
    for (let row = currentRows; row < rowCount; row++) {
        let newRow = [];
        for (let col = 0; col < colCount; col++) {
            newRow.push(
                "#ffffff"
            );
        }
        paintedCells.push(newRow);
    }

    // extend rows with missing cols
    for (let row = 0; row < currentRows; row++) {
        for (let col = currentCols; col < colCount; col++) {
            paintedCells[row].push(
                "#ffffff"
            );
        }
    }

    removePaintedCellsExtra(paintedCells, rowCount, colCount);
}

// removes extra farther then 10 unseen away
function removePaintedCellsExtra(paintedCells, targetRows, targetCols) {
    const maxRows = Math.min(500, targetRows + 10);
    const maxCols = Math.min(500, targetCols + 10);

    // Keep only rows 0..maxRows-1
    paintedCells = paintedCells.slice(0, maxRows);

    // Keep only columns 0..maxCols-1 for each row
    paintedCells = paintedCells.map(row => row.slice(0, maxCols));

    setPaintedCells(paintedCells);
}

// get screenshot
const copyBtn = document.querySelector("#copyBtn");

export async function copyCanvasToClipboard() {
    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error("Failed to create blob from canvas");
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);

        copyBtn.textContent = "Copied";
    } catch (err) {
        copyBtn.textContent = "Error";
    }
    setTimeout(() => {
        copyBtn.textContent = "Copy";
    }, 1000);
}

//saves state to local storage
export function saveToLocalStorage() {
    localStorage.setItem('row', rowCell.value);
    localStorage.setItem('col', colCell.value);
    localStorage.setItem('borderWidth', borderWidth.value);
    localStorage.setItem('borderColor', borderColor.value);

    localStorage.setItem('paintedCells', JSON.stringify(getPaintedCells()));
    localStorage.setItem('recentColors', JSON.stringify(getRecentColors()));
}