let shapeIndex = 0;

let slotIndex = 0;

let selecting = false;


const hotbar = {
 offset: {
  x: canvas.width / 2 - 94,
  y: canvas.height - 44,
 },
 slots: [
  {
   type: "db"
  },
  {
   type: "gb"
  },
  {
   type: "ib"
  },
  {
   type: "clb"
  },
  {
   type: "tob"
  },
  {
   type: "lapb"
  },
  {
   type: "j"
  },
  {
   type: "fire"
  },
  {
   type: "b"
  }
 ]
}

function drawHotbar() {
 let x = hotbar.offset.x + 3;
 ctx.drawImage(images.hotbar, hotbar.offset.x, hotbar.offset.y);
 ctx.drawImage(images.slot, hotbar.offset.x + 20 * slotIndex, hotbar.offset.y);
 hotbar.slots.forEach((states, index) => {
  drawBlock(
   getBlockObject(states),
   { x: (x + index * 20), y: hotbar.offset.y + 3, width: 16, height: 16 }
  );
 });
}

function eyedropper(x, y) {
 const states = structuredClone(mbwom.getBlockState(x, y));
 if (states.type != null) hotbar.slots[slotIndex] = states;
}

function eraser(x, y) {
 const shape = shapes[shapeIndex];
 const offset = Math.floor(shape.length / 2);
 const centerX = x - offset;
 const centerY = y - offset;
 mbwom.traverseShape(centerX, centerY, shape, (i, j) => {
  if (mbwom.scene[i]) {
   delete mbwom.scene[i][j];
   renderBlock(i, j);
  }
 });
}

function brush(x, y) {
 const shape = shapes[shapeIndex];
 const offset = Math.floor(shape.length / 2);
 const centerX = x - offset;
 const centerY = y - offset;
 mbwom.traverseShape(centerX, centerY, shape, (i, j) => {
  const state = hotbar.slots[slotIndex]
  mbwom.setBlockState(i, j, state);
  renderBlock(i, j);
 });
}

function setShape(x, y, shape, state) {
 const offset = Math.floor(shape.length / 2);
 const centerX = x - offset;
 const centerY = y - offset;
 for (let i = 0; i < shape.length; i++) {
  for (let j = 0; j < shape[i].length; j++) {
   const value = shape[i][j];
   if (value != 0) {
    const currentX = centerX + i;
    const currentY = centerY + j;
    if (currentX > -1 && currentY > -1) {
     mbwom.setBlockState(currentX, currentY, state);
     renderBlock(currentX, currentY);
    }
   }
  }
 }
}

function mineAndPlace() {
 if (mouse.right) {
  brush(mouse.worldX, mouse.worldY);
 }
 if (mouse.left) {
  eraser(mouse.worldX, mouse.worldY);
 }
}

const shapes = [
 [
  [1]
 ],
 [
  [1, 1],
  [1, 1]
 ],
 [
  [0, 1],
  [1, 1, 1],
  [0, 1]
 ],
 [
  [0, 1, 1],
  [1, 1, 1, 1],
  [1, 1, 1, 1],
  [0, 1, 1]
 ],
 [
  [0, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1]
 ],
 [
  [0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1]
 ],
 [
  [0, 0, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1]
 ],
 [
  [0, 0, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1]
 ],
]

// Pega la función aquí, al final del archivo:
function takeScreenshot() {
    // 1. Ocultar la UI
    isTakingScreenshot = true;

    // 2. Forzar un renderizado sin la UI inmediatamente
    drawBackgrond();
    drawWorld();

    // 3. Tomar la captura del canvas limpio
    const canvas = document.getElementById("canvas");
    const dataURL = canvas.toDataURL("image/png");

    // 4. Iniciar la descarga
    const downloadLink = document.createElement("a");
    const date = new Date();
    const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours()}${date.getMinutes()}`;
    downloadLink.download = `MB_Screenshot_Clean_${timestamp}.png`;
    downloadLink.href = dataURL;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // 5. Devolver la UI para el siguiente fotograma del juego
    isTakingScreenshot = false;
}


// ==========================================
// HERRAMIENTA DE CAPTURA AVANZADA (MINIMAPA)
// ==========================================

const advScreenshot = {
    startBlock: null, endBlock: null,
    isDragging: false,
    offsetX: 0, offsetY: 0,
    gridW: 120, // El doble del ancho normal
    gridH: 60,  // El doble del alto normal
    tileSize: 8 // Escala reducida para ver más mapa
};

function openAdvancedScreenshot() {
    document.getElementById("screenshot-modal").style.display = "flex";
    const canvas = document.getElementById("preview-canvas");
    
    // Centramos la cámara del minimapa según tu cámara actual
    advScreenshot.offsetX = camera.x - Math.floor((advScreenshot.gridW - grid.width) / 2);
    advScreenshot.offsetY = camera.y - Math.floor((advScreenshot.gridH - grid.height) / 2);
    
    canvas.width = advScreenshot.gridW * advScreenshot.tileSize;
    canvas.height = advScreenshot.gridH * advScreenshot.tileSize;
    
    // Reiniciar selección
    advScreenshot.startBlock = null;
    advScreenshot.endBlock = null;
    
    drawPreview();
}

function closeAdvancedScreenshot() {
    document.getElementById("screenshot-modal").style.display = "none";
}

function drawPreview() {
    const canvas = document.getElementById("preview-canvas");
    const pCtx = canvas.getContext("2d");
    pCtx.imageSmoothingEnabled = false;
    
    // Fondo
    pCtx.fillStyle = "#778fa5";
    pCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar bloques en el minimapa
    for (let x = 0; x < advScreenshot.gridW; x++) {
        for (let y = 0; y < advScreenshot.gridH; y++) {
            const worldX = x + advScreenshot.offsetX;
            const worldY = y + advScreenshot.offsetY;
            const blockObject = getBlockCache(worldX, worldY);
            if (blockObject != null) {
                const pxX = x * advScreenshot.tileSize;
                const pxY = canvas.height - (y + 1) * advScreenshot.tileSize;
                pCtx.drawImage(images.blocks, blockObject.x, blockObject.y, 16, 16, pxX, pxY, advScreenshot.tileSize, advScreenshot.tileSize);
            }
        }
    }
    
    // Dibujar el recuadro verde de la selección
    if (advScreenshot.startBlock && advScreenshot.endBlock) {
        const minX = Math.min(advScreenshot.startBlock.x, advScreenshot.endBlock.x) - advScreenshot.offsetX;
        const maxX = Math.max(advScreenshot.startBlock.x, advScreenshot.endBlock.x) - advScreenshot.offsetX + 1;
        const minY = Math.min(advScreenshot.startBlock.y, advScreenshot.endBlock.y) - advScreenshot.offsetY;
        const maxY = Math.max(advScreenshot.startBlock.y, advScreenshot.endBlock.y) - advScreenshot.offsetY + 1;
        
        const pxX = minX * advScreenshot.tileSize;
        const pxY = canvas.height - maxY * advScreenshot.tileSize;
        const width = (maxX - minX) * advScreenshot.tileSize;
        const height = (maxY - minY) * advScreenshot.tileSize;
        
        pCtx.fillStyle = "rgba(0, 255, 0, 0.3)";
        pCtx.fillRect(pxX, pxY, width, height);
        pCtx.strokeStyle = "#00FF00";
        pCtx.lineWidth = 1;
        pCtx.strokeRect(pxX, pxY, width, height);
    }
}

// Convertir posición del ratón en bloque del minimapa
function getPreviewBlock(event) {
    const canvas = document.getElementById("preview-canvas");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const gridX = Math.floor(x / advScreenshot.tileSize);
    const gridY = Math.floor((canvas.height - y) / advScreenshot.tileSize);
    
    return {
        x: gridX + advScreenshot.offsetX,
        y: gridY + advScreenshot.offsetY
    };
}

// Eventos de ratón robustos para trazar la selección
document.addEventListener("mousedown", (e) => {
    if (e.target.id === "preview-canvas") {
        advScreenshot.isDragging = true;
        advScreenshot.startBlock = getPreviewBlock(e);
        advScreenshot.endBlock = advScreenshot.startBlock;
        drawPreview();
    }
});

document.addEventListener("mousemove", (e) => {
    if (advScreenshot.isDragging && e.target.id === "preview-canvas") {
        advScreenshot.endBlock = getPreviewBlock(e);
        drawPreview();
    }
});

window.addEventListener("mouseup", () => {
    advScreenshot.isDragging = false;
});

// Generador de la imagen final en alta resolución
function downloadAdvancedScreenshot() {
    if (!advScreenshot.startBlock || !advScreenshot.endBlock) {
        alert("¡Primero haz clic y arrastra en el mapa para seleccionar un área!");
        return;
    }
    
    const minX = Math.min(advScreenshot.startBlock.x, advScreenshot.endBlock.x);
    const maxX = Math.max(advScreenshot.startBlock.x, advScreenshot.endBlock.x);
    const minY = Math.min(advScreenshot.startBlock.y, advScreenshot.endBlock.y);
    const maxY = Math.max(advScreenshot.startBlock.y, advScreenshot.endBlock.y);
    
    const blocksWidth = maxX - minX + 1;
    const blocksHeight = maxY - minY + 1;
    
    // Canvas invisible para máxima resolución (16px por bloque)
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = blocksWidth * 16;
    tempCanvas.height = blocksHeight * 16;
    const tCtx = tempCanvas.getContext("2d");
    tCtx.imageSmoothingEnabled = false;
    
    tCtx.fillStyle = "#778fa5";
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    for (let x = 0; x < blocksWidth; x++) {
        for (let y = 0; y < blocksHeight; y++) {
            const worldX = minX + x;
            const worldY = minY + y;
            const blockObject = getBlockCache(worldX, worldY);
            if (blockObject != null) {
                const pxX = x * 16;
                const pxY = tempCanvas.height - (y + 1) * 16;
                tCtx.drawImage(images.blocks, blockObject.x, blockObject.y, 16, 16, pxX, pxY, 16, 16);
            }
        }
    }
    
    // Descargar
    const dataURL = tempCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    const date = new Date();
    const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours()}${date.getMinutes()}`;
    downloadLink.download = `MB_Area_${timestamp}.png`;
    downloadLink.href = dataURL;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    closeAdvancedScreenshot();
}

// Movimiento del minimapa con WASD
document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("screenshot-modal");
    
    // Solo registrar el movimiento si la ventana avanzada está abierta
    if (modal && modal.style.display === "flex") {
        const panSpeed = 10; // Cantidad de bloques que se mueve por cada pulsación
        
        if (e.code === "KeyW") advScreenshot.offsetY += panSpeed;
        if (e.code === "KeyS") advScreenshot.offsetY -= panSpeed;
        if (e.code === "KeyA") advScreenshot.offsetX -= panSpeed;
        if (e.code === "KeyD") advScreenshot.offsetX += panSpeed;
        
        // Redibujar el minimapa para mostrar el desplazamiento
        if (["KeyW", "KeyS", "KeyA", "KeyD"].includes(e.code)) {
            drawPreview();
        }
    }
});