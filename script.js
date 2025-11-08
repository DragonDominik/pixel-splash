const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const rowCell = document.querySelector("#rowNumber");
const colCell = document.querySelector("#colNumber");
const borderWidth = document.querySelector("#borderWidth");
const borderColor = document.querySelector("#borderColor");
rowCell.addEventListener("input", resizePage);
colCell.addEventListener("input", resizePage);
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

function getRowCount() {
    return Math.max(1, Number(rowCell.value));
}

function getColCount() {
    return Math.max(1, Number(colCell.value));
}

function resizePage() {
    const baseDpr = window.devicePixelRatio || 1;
    const smoothening = 3; // for smoother canvas
    const dpr = baseDpr * smoothening;

    // get cellsize
    const maxWidth = (document.documentElement.clientWidth * 0.8) / getColCount();
    const maxHeight = (document.documentElement.clientHeight * 0.8) / getRowCount();
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

    drawGrid();
    if (paintedCells.length > 0) {
        fixPaintedCellsSize();
    }
    reColorCells();
}

function drawGrid() {
    // clear canvas
    ctx.fillStyle = '#ffffff'; // white background
    ctx.fillRect(0, 0, cellSize * getColCount(), cellSize * getRowCount());

    // draw grid
    if (borderWidth.value != 0) {
        canvas.classList.remove("border");
        ctx.beginPath();
        for (let i = 0; i <= getColCount(); i++) {
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, cellSize * getRowCount());
        }
        for (let j = 0; j <= getRowCount(); j++) {
            ctx.moveTo(0, j * cellSize);
            ctx.lineTo(cellSize * getColCount(), j * cellSize);
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
    for (row = 0; row < getRowCount(); row++) {
        let currentRow = [];
        for (col = 0; col < getColCount(); col++) {
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

//adds missing cols and rows to PaintedCells on expansion
function fixPaintedCellsSize() {
    const currentRows = paintedCells.length;
    const currentCols = paintedCells[0] ? paintedCells[0].length : 0;

    // add missing rows
    console.log(currentRows, getRowCount());
    for (let row = currentRows; row < getRowCount(); row++) {
        let newRow = [];
        for (let col = 0; col < getColCount(); col++) {
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
        for (let col = currentCols; col < getColCount(); col++) {
            paintedCells[row].push({
                row: row,
                col: col,
                colored: false,
                color: null
            });
        }
    }
    
    removePaintedCellsExtra();
}

// removes empty rows and columns for performance
function removePaintedCellsExtra() {
 const targetRows = Number(getRowCount());
    const targetCols = Number(getColCount());

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

    //if we are color picking
    if (isPickingColor) {
        const pickedColor = paintedCells[currentCell.row][currentCell.col].color || '#ffffff';
        penColor.value = pickedColor;

        isPickingColor = false;
        eyedropperBtn.classList.remove('bg-green-400');
        eyedropperBtn.classList.add('hover:bg-gray-300');
        return;
    }

    if (paintedCells[currentCell.row][currentCell.col].colored && paintedCells[currentCell.row][currentCell.col].color == penColor.value) {
        colorCell(currentCell, "#ffffff", false);
    } else {
        colorCell(currentCell, penColor.value);
        addToRecentColors(penColor.value);
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

// Recent colors

let recentColors = [];
const maxRecentColors = 10;
const recentColorsContainer = document.getElementById('recentColors');

function addToRecentColors(color) {
    if (!color) return;
    //remove if exists already
    recentColors = recentColors.filter(c => c !== color);
    // add to start
    recentColors.unshift(color);
    // max 10 colors
    if (recentColors.length > maxRecentColors) recentColors.pop();

    renderRecentColors();
}

function renderRecentColors() {
    recentColorsContainer.innerHTML = '';
    recentColors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.className = 'w-8 h-8 border border-black rounded-sm cursor-pointer';
        colorBox.style.backgroundColor = color;
        colorBox.addEventListener('click', () => {
            penColor.value = color;
        });
        recentColorsContainer.appendChild(colorBox);
    });
}

// Color picker
let isPickingColor = false;
const eyedropperBtn = document.getElementById('colorPickerBtn');
eyedropperBtn.addEventListener('click', startColorPicking);

function startColorPicking() {
    isPickingColor = true;
    eyedropperBtn.classList.remove('hover:bg-gray-300');
    eyedropperBtn.classList.add('bg-green-400');
}
