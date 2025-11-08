import { penColor } from './elements.js';

let isPickingColor = false;
const eyedropperBtn = document.getElementById('colorPickerBtn');
eyedropperBtn.addEventListener('click', startColorPicking);

export function getIsPickingColor(){
    return isPickingColor;
}

export function setIsPickingColor(value){
    isPickingColor = value;
}

function startColorPicking() {
    isPickingColor = true;
    eyedropperBtn.classList.remove('hover:bg-gray-300');
    eyedropperBtn.classList.add('bg-green-400');
}

const recentColorsContainer = document.getElementById('recentColors');
let recentColors = [];

export function getRecentColors(){
    return recentColors;
}

const maxRecentColors = 10;

export function addToRecentColors(color) {
    if (!color) return;
    //remove if exists already
    recentColors = recentColors.filter(c => c !== color);
    // add to start
    recentColors.unshift(color);
    // max 10 colors
    if (recentColors.length > maxRecentColors) recentColors.pop();

    renderRecentColors();
}

export function renderRecentColors() {
    if (!recentColors) {
        return;
    }
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
