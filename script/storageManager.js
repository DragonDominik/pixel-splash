import { rowCell, colCell, canvas } from "./elements.js";
import { setPaintedCells, getPaintedCells } from "./drawing.js";
import { addToRecentColors, getRecentColors } from "./colorBar.js";
import { resizePage } from "./actionManager.js";

//load data from storage
export function load() {
    rowCell.value = Number(localStorage.getItem('row')) ?? 5;
    colCell.value = Number(localStorage.getItem('col')) ?? 5;

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
    } else {
        recentColors = [];
    }
    resizePage();
}

//makes paintedCell
export function setCleanCellGrid(rowCount, colCount) {
    let cellGrid = [];
    for (let row = 0; row < rowCount; row++) {
        let currentRow = [];
        for (let col = 0; col < colCount; col++) {
            currentRow.push({
                "row": row,
                "col": col,
                "colored": false,
                "color": null
            });
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
            newRow.push({
                row: row,
                col: col,
                colored: false,
                color: null
            });
        }
        paintedCells.push(newRow);
    }

    // extend rows with missing cols
    for (let row = 0; row < currentRows; row++) {
        for (let col = currentCols; col < colCount; col++) {
            paintedCells[row].push({
                row: row,
                col: col,
                colored: false,
                color: null
            });
        }
    }

    removePaintedCellsExtra(paintedCells, rowCount, colCount);
}

// removes empty rows and columns for performance
function removePaintedCellsExtra(paintedCells, targetRows, targetCols) {
    // remove extra rows
    while (paintedCells.length > targetRows) {
        const lastRow = paintedCells[paintedCells.length - 1];
        if (lastRow.every(cell => !cell.colored)) {
            paintedCells.pop();
        } else break;
    }

    // remove extra columns
    if (paintedCells[0]) {
        while (paintedCells[0].length > targetCols) {
            const lastColIndex = paintedCells[0].length - 1;
            let isEmpty = true;
            for (let row = 0; row < paintedCells.length; row++) {
                if (paintedCells[row][lastColIndex] && paintedCells[row][lastColIndex].colored) {
                    isEmpty = false;
                    break;
                }
            }
            if (isEmpty) {
                for (let row = 0; row < paintedCells.length; row++) {
                    paintedCells[row].pop();
                }
            } else break;
        }
    }

    setPaintedCells(paintedCells);
}

const bottomRow1 = document.querySelector("#BottomRow1");
const bottomRow2 = document.querySelector("#BottomRow2");

// get screenshot
export async function copyCanvasToClipboard() {
    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error("Failed to create blob from canvas");
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);

        bottomRow1.classList.add('hidden');

        bottomRow2.textContent = "Image copied to clipboard";
        bottomRow2.classList.remove('hidden');
    } catch (err) {
        bottomRow1.classList.add('hidden');

        bottomRow2.textContent = "Error while copying";
        bottomRow2.classList.remove('hidden');
    }
    setTimeout(() => {
        bottomRow2.classList.add('hidden');
        bottomRow2.textContent = "";

        bottomRow1.classList.remove('hidden');
    }, 1000);
}

//saves state to local storage
export function saveToLocalStorage() {
    localStorage.setItem('row', rowCell.value);
    localStorage.setItem('col', colCell.value);

    localStorage.setItem('paintedCells', JSON.stringify(getPaintedCells()));
    localStorage.setItem('recentColors', JSON.stringify(getRecentColors()));
}