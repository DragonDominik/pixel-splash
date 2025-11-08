import { canvas, ctx, borderWidth, borderColor } from "./elements.js"
import { saveToLocalStorage } from "./storageManager.js";

export let paintedCells = [];

export function setPaintedCells(list) {
    paintedCells = list;
}

export function getPaintedCells() {
    return paintedCells;
}

export function drawGrid(rowCount, colCount, cellSize) {
    // clear canvas
    ctx.fillStyle = '#ffffff'; // white background
    ctx.fillRect(0, 0, cellSize * colCount, cellSize * rowCount);

    // draw grid
    if (borderWidth.value != 0) {
        canvas.classList.remove("border");
        ctx.beginPath();
        for (let i = 0; i <= colCount; i++) {
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, cellSize * rowCount);
        }
        for (let j = 0; j <= rowCount; j++) {
            ctx.moveTo(0, j * cellSize);
            ctx.lineTo(cellSize * colCount, j * cellSize);
        }
        ctx.strokeStyle = borderColor.value;
        ctx.lineWidth = borderWidth.value;
        ctx.stroke();
    } else {
        canvas.classList.add("border");
    }
}

//recolors everythin on reload
export function reColorCells(cellSize) {
    for (let row = 0; row < paintedCells.length; row++) {
        for (let col = 0; col < paintedCells[row].length; col++) {
            const cell = paintedCells[row][col];
            if (cell.colored) {
                colorCell(cellSize, {"row": row, "col": col}, cell.color);
            }
        }
    }
}

// color specific cell
export function colorCell(cellSize, cell, color, isColoring = true) {
    paintedCells[cell.row][cell.col].colored = isColoring;
    paintedCells[cell.row][cell.col].color = isColoring ? color : null;

    // color it
    ctx.fillStyle = color;
    ctx.fillRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);

    // redraw grid lines
    if (borderWidth.value != 0) {
        ctx.beginPath();
        ctx.moveTo(cell.col * cellSize, cell.row * cellSize);
        ctx.lineTo(cell.col * cellSize + cellSize, cell.row * cellSize);
        ctx.lineTo(cell.col * cellSize + cellSize, cell.row * cellSize + cellSize);
        ctx.lineTo(cell.col * cellSize, cell.row * cellSize + cellSize);
        ctx.closePath();
        ctx.strokeStyle = borderColor.value;
        ctx.lineWidth = borderWidth.value;
        ctx.stroke();
    }

    //save
    saveToLocalStorage();
}