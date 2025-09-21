const cardPositionsKey = 'spanishCheatsheetCardPositions';
const canvasTransformKey = 'spanishCheatsheetCanvasTransform';
const themeKey = 'spanishCheatsheetTheme';

const canvas = document.getElementById('canvas');
const zoomIndicator = document.getElementById('zoom-indicator');
const resetPositionsBtn = document.getElementById('reset-positions-btn');

// --- THEME LOGIC ---
const customSelect = document.getElementById('custom-theme-select');
const selectedOption = customSelect.querySelector('.select-selected');
const optionsContainer = customSelect.querySelector('.select-items');
const options = customSelect.querySelectorAll('.select-item');
let activeTheme = 'system'; // Default, will be updated on load

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem(themeKey, theme);
    activeTheme = theme;

    const selectedItem = Array.from(options).find(opt => opt.dataset.value === theme);
    if (selectedItem) {
        selectedOption.textContent = selectedItem.textContent;
    }
}

function previewTheme(theme) {
    document.body.className = `theme-${theme}`;
}

// --- UNIFIED TRANSFORM STATE ---
let transformState = { scale: 1, x: 0, y: 0 };

function applyCanvasTransform() {
    canvas.style.transform = `translate(${transformState.x}px, ${transformState.y}px) scale(${transformState.scale})`;
    updateZoomIndicator();
}

function updateZoomIndicator() {
    const zoomLevel = Math.round(transformState.scale * 100);
    if (zoomLevel === 100) {
        zoomIndicator.innerText = 'Scroll to zoom?';
    } else {
        zoomIndicator.innerText = `${zoomLevel}%`;
    }
}

function saveTransformState() {
    localStorage.setItem(canvasTransformKey, JSON.stringify(transformState));
}

function updateResetButtonState() {
    const positions = JSON.parse(localStorage.getItem(cardPositionsKey));
    if (!positions || Object.keys(positions).length === 0) {
        resetPositionsBtn.innerText = 'Drag by title';
        resetPositionsBtn.disabled = true;
    } else {
        resetPositionsBtn.innerText = 'Сбросить позиции';
        resetPositionsBtn.disabled = false;
    }
}

// --- PAGE LOAD & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load and apply the saved theme
    const savedTheme = localStorage.getItem(themeKey) || 'system';
    applyTheme(savedTheme);

    // 2. Initialize Custom Select Dropdown
    selectedOption.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsContainer.classList.toggle('select-hide');
        selectedOption.classList.toggle('select-arrow-active');
    });

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTheme = option.getAttribute('data-value');
            applyTheme(newTheme);
            optionsContainer.classList.add('select-hide');
            selectedOption.classList.remove('select-arrow-active');
        });

        option.addEventListener('mouseenter', () => {
            const previewThemeValue = option.getAttribute('data-value');
            previewTheme(previewThemeValue);
            previewHighlight(true);
        });
    });

    optionsContainer.addEventListener('mouseleave', () => {
        previewTheme(activeTheme);
        previewHighlight(false);
    });

    window.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            optionsContainer.classList.add('select-hide');
            selectedOption.classList.remove('select-arrow-active');
        }
    });

    // 3. Load saved positions for cards and canvas
    const savedCardPositions = JSON.parse(localStorage.getItem(cardPositionsKey));
    if (savedCardPositions) {
        for (const id in savedCardPositions) {
            const element = document.getElementById(id);
            if (element) {
                const pos = savedCardPositions[id];
                element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                element.setAttribute('data-x', pos.x);
                element.setAttribute('data-y', pos.y);
            }
        }
    }
    const savedTransform = JSON.parse(localStorage.getItem(canvasTransformKey));
    if (savedTransform) { transformState = savedTransform; }
    
    applyCanvasTransform();
    updateResetButtonState();

    // 4. Reveal the canvas
    setTimeout(() => {
        document.body.classList.remove('is-loading');
    }, 50);
});

// --- OTHER CONTROLS ---
resetPositionsBtn.addEventListener('click', () => {
    localStorage.removeItem(cardPositionsKey);
    const cards = document.querySelectorAll('.tense-card');
    cards.forEach(card => {
        card.classList.add('is-animating');
        card.style.transform = 'translate(0px, 0px)';
        card.setAttribute('data-x', 0);
        card.setAttribute('data-y', 0);
        setTimeout(() => card.classList.remove('is-animating'), 400);
    });
    updateResetButtonState();
});

zoomIndicator.addEventListener('click', () => {
    canvas.classList.add('is-animating');
    transformState = { scale: 1, x: 0, y: 0 };
    saveTransformState();
    applyCanvasTransform();
    setTimeout(() => canvas.classList.remove('is-animating'), 400);
});
zoomIndicator.addEventListener('mouseover', () => { zoomIndicator.innerText = 'Сбросить на 100%'; });
zoomIndicator.addEventListener('mouseout', () => { updateZoomIndicator(); });

// --- INTERACTION LOGIC (Drag, Pan, Zoom, Highlight) ---

window.addEventListener('wheel', event => {
    event.preventDefault();
    const oldScale = transformState.scale;
    const zoomFactor = 1.05;
    if (event.deltaY < 0) { transformState.scale *= zoomFactor; } 
    else { transformState.scale /= zoomFactor; }
    transformState.scale = Math.max(0.2, Math.min(transformState.scale, 5));
    transformState.x = event.clientX - (event.clientX - transformState.x) * (transformState.scale / oldScale);
    transformState.y = event.clientY - (event.clientY - transformState.y) * (transformState.scale / oldScale);
    applyCanvasTransform();
    saveTransformState();
}, { passive: false });

interact(document.body)
    .draggable({
        styleCursor: false,
        ignoreFrom: '.tense-card, .controls',
        listeners: {
            start() { document.body.classList.add('is-panning'); },
            move(event) {
                transformState.x += event.dx;
                transformState.y += event.dy;
                applyCanvasTransform();
            },
            end() { 
                document.body.classList.remove('is-panning');
                saveTransformState();
            }
        }
    })
    .gesturable({
        listeners: {
            move (event) {
                const oldScale = transformState.scale;
                transformState.scale *= (1 + event.ds);
                transformState.scale = Math.max(0.2, Math.min(transformState.scale, 5));
                transformState.x = event.clientX - (event.clientX - transformState.x) * (transformState.scale / oldScale);
                transformState.y = event.clientY - (event.clientY - transformState.y) * (transformState.scale / oldScale);
                applyCanvasTransform();
            }
        },
        onend: saveTransformState
    });

interact('.tense-card').draggable({
    allowFrom: 'h2',
    styleCursor: false,
    listeners: {
        start(event) { event.target.classList.add('is-dragging'); },
        move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + (event.dx / transformState.scale);
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + (event.dy / transformState.scale);
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        },
        end(event) {
            event.target.classList.remove('is-dragging');
            const target = event.target;
            const x = parseFloat(target.getAttribute('data-x')) || 0;
            const y = parseFloat(target.getAttribute('data-y')) || 0;
            const positions = JSON.parse(localStorage.getItem(cardPositionsKey)) || {};
            positions[target.id] = { x, y };
            localStorage.setItem(cardPositionsKey, JSON.stringify(positions));
            updateResetButtonState();
        }
    }
});

canvas.addEventListener('mouseover', handleHighlight);
canvas.addEventListener('mouseout', handleHighlight);
function handleHighlight(event) {
    const target = event.target.closest('[data-group]');
    if (!target) return;
    const shouldAdd = event.type === 'mouseover';
    const groups = target.dataset.group;
    if (!groups) return;
    const groupArray = groups.split(' ');
    groupArray.forEach(group => {
        if (group.trim() === '') return;
        const elements = document.querySelectorAll(`[data-group~="${group.trim()}"]`);
        elements.forEach(el => el.classList.toggle('highlight', shouldAdd));
    });
}

function previewHighlight(shouldHighlight) {
    const elements = document.querySelectorAll(`[data-group~="p2"]`);
    elements.forEach(el => el.classList.toggle('highlight', shouldHighlight));
}