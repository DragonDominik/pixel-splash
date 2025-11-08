const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const rowCell = document.querySelector("#rowNumber");
const colCell = document.querySelector("#colNumber");
const borderWidth = document.querySelector("#borderWidth");
const borderColor = document.querySelector("#borderColor");
rowCell.addEventListener("input", reset);
colCell.addEventListener("input", reset);
borderWidth.addEventListener("input", resizePage);
borderColor.addEventListener("input", resizePage);

const resetBtn = document.querySelector("#resetBtn");
resetBtn.addEventListener('click', reset);

const copyBtn = document.querySelector("#copyBtn");
copyBtn.addEventListener('click', copyCanvasToClipboard);

let cellSize = 0;
let paintedCells = []

function reset() {
    paintedCells = [];
    resizePage();
    setUpCellGrid();
}

function resizePage() {
    const baseDpr = window.devicePixelRatio || 1;
    const smoothening = 3; // for smoother canvas
    const dpr = baseDpr * smoothening;

    // get cellsize
    const maxWidth = (document.documentElement.clientWidth * 0.8) / colCell.value;
    const maxHeight = (document.documentElement.clientHeight * 0.8) / rowCell.value;
    cellSize = Math.min(maxWidth, maxHeight);

    // Set canvas size in CSS pixels
    canvas.style.width = `${cellSize * colCell.value}px`;
    canvas.style.height = `${cellSize * rowCell.value}px`;

    // set canvas resolution
    canvas.width = cellSize * colCell.value * dpr;
    canvas.height = cellSize * rowCell.value * dpr;

    // scale content to dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    drawGrid();
    reColorCells();
}

function drawGrid() {

    // clear canvas
    ctx.fillStyle = '#ffffff'; // white background
    ctx.fillRect(0, 0, cellSize * colCell.value, cellSize * rowCell.value);

    // draw grid
    if (borderWidth.value != 0) {
        canvas.classList.remove("border");
        ctx.beginPath();
        for (let i = 0; i <= colCell.value; i++) {
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, cellSize * rowCell.value);
        }
        for (let j = 0; j <= rowCell.value; j++) {
            ctx.moveTo(0, j * cellSize);
            ctx.lineTo(cellSize * colCell.value, j * cellSize);
        }
        ctx.strokeStyle = borderColor.value;
        ctx.lineWidth = borderWidth.value;
        ctx.stroke();
    } else {
        canvas.classList.add("border");
    }
}

window.addEventListener('resize', resizePage);

reset();

// COLORING ################################
function setUpCellGrid() {
    for (row = 0; row < rowCell.value; row++) {
        let currentRow = [];
        for (col = 0; col < colCell.value; col++) {
            currentRow.push({
                "row": row,
                "col": col,
                "colored": false,
                "color": null
            });
        }
        paintedCells.push(currentRow);
    }
}

const penColor = document.querySelector('#penColor');

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

    if (paintedCells[currentCell.row][currentCell.col].colored && paintedCells[currentCell.row][currentCell.col].color == penColor.value) {
        colorCell(currentCell, "#ffffff", false)
    } else {
        colorCell(currentCell, penColor.value)
    }
}
canvas.addEventListener('click', cellClicked);

// color specific cell
function colorCell(cell, color, isColoring = true) {
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
}

function reColorCells() {
    for (let row = 0; row < paintedCells.length; row++) {
        for (let col = 0; col < paintedCells[row].length; col++) {
            const cell = paintedCells[row][col];
            if (cell.colored) {
                colorCell(cell, cell.color);
            }
        }
    }
}

const bottomRow1 = document.querySelector("#BottomRow1");
const bottomRow2 = document.querySelector("#BottomRow2");

// get screenshot
async function copyCanvasToClipboard() {
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
