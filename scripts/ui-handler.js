// ==========================================
// 1. LÓGICA DE PESTAÑAS (RIBBON)
// ==========================================
function switchTab(tabId, element) {
    document.querySelectorAll('.ribbon-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    element.classList.add('active');
}

// ==========================================
// 2. INVENTARIO MODAL (ALL BLOCKS)
// ==========================================
function openInventory() {
    const modal = document.getElementById("inventory-modal");
    const grid = document.getElementById("inventory-grid");
    
    if (grid.children.length === 0) {
        const blockIds = Object.keys(texturesMap);
        blockIds.forEach(id => {
            if (id === "missing") return;
            const texture = texturesMap[id];
            const slot = document.createElement("div");
            slot.className = "inv-slot";
            slot.title = id;
            
            const cvs = document.createElement("canvas");
            cvs.width = 16; cvs.height = 16;
            const cCtx = cvs.getContext("2d");
            cCtx.imageSmoothingEnabled = false;
            cCtx.drawImage(images.blocks, texture.x, texture.y, 16, 16, 0, 0, 16, 16);
            slot.appendChild(cvs);

            slot.onclick = () => {
                hotbar.slots[slotIndex] = { type: id };
                if (typeof renderHtmlHotbar === "function") renderHtmlHotbar();
                closeInventory();
            };
            grid.appendChild(slot);
        });
    }
    modal.style.display = "flex";
}

function closeInventory() {
    document.getElementById("inventory-modal").style.display = "none";
}

// ==========================================
// 3. RENDERIZADO HOTBAR HTML
// ==========================================
function renderHtmlHotbar() {
    const container = document.getElementById("html-hotbar");
    if (!container) return;
    container.innerHTML = ""; 
    
    hotbar.slots.forEach((states, index) => {
        const slotDiv = document.createElement("div");
        slotDiv.className = "hotbar-slot";
        if (index === slotIndex) slotDiv.classList.add("active-slot");

        const cvs = document.createElement("canvas");
        cvs.width = 16; cvs.height = 16;
        const cCtx = cvs.getContext("2d");
        cCtx.imageSmoothingEnabled = false;

        const blockObj = getBlockObject(states);
        if(images.blocks.complete && images.blocks.naturalHeight !== 0) {
            cCtx.drawImage(images.blocks, blockObj.x, blockObj.y, 16, 16, 0, 0, 16, 16);
        }
        
        slotDiv.appendChild(cvs);
        slotDiv.onclick = () => {
            slotIndex = index;
            renderHtmlHotbar();
        };
        container.appendChild(slotDiv);
    });
}

// ==========================================
// 4. LÓGICA DE ACHIEVEMENTS (LOGROS)
// ==========================================
function openAchievements() {
    document.getElementById("achievements-modal").style.display = "flex";
    
    // Al abrir, leer los logros actuales del archivo cargado
    if (mbwom.world) {
        const checkboxes = document.querySelectorAll('#achievements input[type="checkbox"]');
        checkboxes.forEach((cb, i) => {
            cb.checked = mbwom.getAchievement(i);
        });
    }
}

function closeAchievements() {
    document.getElementById("achievements-modal").style.display = "none";
}

function toggleAchievements(checked) {
    const checkboxes = document.querySelectorAll('#achievements input[type="checkbox"]');
    checkboxes.forEach((cb, i) => {
        cb.checked = checked;
        // Si hay mundo cargado, aplicar inmediatamente
        if (mbwom.world) mbwom.setAchievement(checked, i);
    });
}

// Guardar logro individualmente cuando se hace clic en una sola casilla
document.querySelectorAll('#achievements input[type="checkbox"]').forEach((cb, i) => {
    cb.addEventListener('change', function() {
        if (mbwom.world) mbwom.setAchievement(this.checked, i);
    });
});

// ==========================================
// 5. CONTROLES DEL MUNDO (GAMEMODE, CHEATS, ETC)
// ==========================================
document.getElementById("gamemode").addEventListener("change", function() {
    if (mbwom.world) mbwom.world.gamemode = parseInt(this.value);
});

document.getElementById("cheats").addEventListener("change", function() {
    if (mbwom.world) mbwom.world.cheats = this.checked;
});

document.getElementById("hardcore").addEventListener("change", function() {
    if (mbwom.world) mbwom.world.hardcore = this.checked;
});

// ==========================================
// 6. GESTIÓN DE DIMENSIÓN
// ==========================================
document.getElementById("dimension").addEventListener("change", function () {
    if (mbwom.world) {
        const sceneIndex = parseInt(this.value);
        if (mbwom.world["scene" + sceneIndex]) {
            mbwom.loadScene(sceneIndex);
            initializeWorldCache();
        }
    }
});