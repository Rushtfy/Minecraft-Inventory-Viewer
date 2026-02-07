const mainGrid = document.getElementById('main-slots');
const hotbarGrid = document.getElementById('hotbar-slots');
const enderGrid = document.getElementById('ender-slots');
const shulkerGrid = document.getElementById('shulker-slots');

function createSlots(container, start, end, type) {
    for (let i = start; i < end; i++) {
        let div = document.createElement('div');
        div.className = 'slot';
        div.dataset.slot = i;
        if (type) div.dataset.type = type;
        container.appendChild(div);
    }
}

createSlots(mainGrid, 9, 36, 'main');
createSlots(hotbarGrid, 0, 9, 'main');
createSlots(enderGrid, 0, 27, 'ender');
createSlots(shulkerGrid, 0, 27, 'shulker');

const MAX_DURABILITY = {
    "leather_helmet": 55,
    "chainmail_helmet": 165,
    "iron_helmet": 165,
    "golden_helmet": 77,
    "diamond_helmet": 363,
    "netherite_helmet": 407,
    "turtle_helmet": 275,

    "leather_chestplate": 80,
    "chainmail_chestplate": 240,
    "iron_chestplate": 240,
    "golden_chestplate": 112,
    "diamond_chestplate": 528,
    "netherite_chestplate": 592,

    "leather_leggings": 75,
    "chainmail_leggings": 225,
    "iron_leggings": 225,
    "golden_leggings": 105,
    "diamond_leggings": 495,
    "netherite_leggings": 555,

    "leather_boots": 65,
    "chainmail_boots": 195,
    "iron_boots": 195,
    "golden_boots": 91,
    "diamond_boots": 429,
    "netherite_boots": 481,

    "wooden_sword": 59,
    "stone_sword": 131,
    "iron_sword": 250,
    "golden_sword": 32,
    "diamond_sword": 1561,
    "netherite_sword": 2031,

    "wooden_pickaxe": 59,
    "stone_pickaxe": 131,
    "iron_pickaxe": 250,
    "golden_pickaxe": 32,
    "diamond_pickaxe": 1561,
    "netherite_pickaxe": 2031,

    "wooden_axe": 59,
    "stone_axe": 131,
    "iron_axe": 250,
    "golden_axe": 32,
    "diamond_axe": 1561,
    "netherite_axe": 2031,

    "wooden_shovel": 59,
    "stone_shovel": 131,
    "iron_shovel": 250,
    "golden_shovel": 32,
    "diamond_shovel": 1561,
    "netherite_shovel": 2031,

    "wooden_hoe": 59,
    "stone_hoe": 131,
    "iron_hoe": 250,
    "golden_hoe": 32,
    "diamond_hoe": 1561,
    "netherite_hoe": 2031,

    "bow": 384,
    "crossbow": 465,
    "trident": 250,
    "shield": 336,
    "mace": 500,

    "flint_and_steel": 64,
    "shears": 238,
    "fishing_rod": 64,
    "elytra": 432,
    "carrot_on_a_stick": 25,
    "warped_fungus_on_a_stick": 100,
    "brush": 64
};

window.onclick = function (event) {
    const modal = document.getElementById('shulkerModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById('file-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const status = document.getElementById('status');
    status.textContent = "Processing...";

    document.querySelectorAll('.slot').forEach(slot => {
        slot.innerHTML = '';
        slot.removeAttribute('title');
        slot.classList.remove('shulker-slot');
        slot.onclick = null;
    });

    document.getElementById('gui').style.display = 'none';

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const buffer = evt.target.result;
            let dataToParse;

            try {
                dataToParse = pako.ungzip(new Uint8Array(buffer));
            } catch (err) {
                dataToParse = buffer;
            }

            nbt.parse(dataToParse, function (error, data) {
                if (error) {
                    status.innerHTML = `<span class="error">NBT Error: ${error.message}</span>`;
                    return;
                }

                document.getElementById('gui').style.display = 'block';
                status.textContent = "Loaded: " + file.name;
                processData(data);
            });

        } catch (err) {
            status.innerHTML = `<span class="error">Error: ${err.message}</span>`;
        }
    };
    reader.readAsArrayBuffer(file);
});

function processData(nbtData) {
    let root = nbtData.value;
    let player = root;

    if (root.Data) {
        const insideData = root.Data.value;
        player = insideData.Player ? insideData.Player.value : insideData;
    }

    console.log(player);
    if (player.Inventory) {
        const rawInv = player.Inventory.value;
        const inventoryList = Array.isArray(rawInv) ? rawInv : rawInv.value;

        inventoryList.forEach(item => {
            const slotIndex = item.Slot.value;
            const id = item.id.value.replace(':', '_');
            const count = item.count.value;
            const components = item.components || item.tag;

            const slotDiv = document.querySelector(`.slot[data-type="main"][data-slot="${slotIndex}"]`);
            if (slotDiv) {
                renderItem(slotDiv, id, count, components);
            }
        });
    }

    if (player.EnderItems) {
        const rawEnder = player.EnderItems.value;
        const enderList = Array.isArray(rawEnder) ? rawEnder : rawEnder.value;

        enderList.forEach(item => {
            const slotIndex = item.Slot.value;
            const id = item.id.value.replace(':', '_');
            const count = item.count.value;
            const components = item.components || item.tag;

            const slotDiv = document.querySelector(`.slot[data-type="ender"][data-slot="${slotIndex}"]`);
            if (slotDiv) {
                renderItem(slotDiv, id, count, components);
            }
        });
    }

    const metaDiv = document.getElementById('meta-data');
    let info = "";
    if (player.Pos && player.Pos.value) {
        const posRaw = player.Pos.value;
        const pos = Array.isArray(posRaw) ? posRaw : posRaw.value;
        if (pos && pos.length >= 3) {
            info += `Position: X=${Math.round(pos[0])} Y=${Math.round(pos[1])} Z=${Math.round(pos[2])} | `;
        }
    }
    if (player.XpLevel) {
        info += `XP Level: ${player.XpLevel.value}`;
    }
    metaDiv.textContent = info;
}

function renderItem(container, id, count, components) {
    const img = document.createElement('img');
    const baseUrl = "./assets/";
    img.src = baseUrl + id + ".png";

    img.onerror = function () {
        this.style.display = 'none';
        container.innerText = id.substring(0, 5).toUpperCase();
        container.style.fontSize = "10px";
        container.style.color = "#7a1616";
        container.style.fontWeight = "bold";
    };
    container.appendChild(img);

    if (count > 1) {
        const countSpan = document.createElement('span');
        countSpan.className = 'item-count';
        countSpan.textContent = count;
        container.appendChild(countSpan);
    }

    let damageTaken = 0;
    let maxDurability = MAX_DURABILITY[id.replace('minecraft_', '')] || 0;

    if (components && components.value) {
        const comp = components.value;
        if (comp['minecraft:damage']) damageTaken = comp['minecraft:damage'].value;
        else if (comp['Damage']) damageTaken = comp['Damage'].value;
    }

    if (damageTaken > 0 && maxDurability > 0) {
        const currentHealth = maxDurability - damageTaken;
        const percent = currentHealth / maxDurability;
        const bar = document.createElement('div');
        bar.className = 'durability-bar';
        bar.style.display = 'block';
        const fill = document.createElement('div');
        fill.className = 'durability-fill';
        fill.style.width = (percent * 100) + "%";
        fill.style.backgroundColor = `hsl(${percent * 120}, 100%, 50%)`;
        bar.appendChild(fill);
        container.appendChild(bar);
        var durabilityText = `<br><span style="color:#aaa">Durability: ${currentHealth} / ${maxDurability}</span>`;
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    let tooltipText = `<span style="color:#ffffff">${formatName(id).replace("Minecraft ", "").replace("Portablecraftingtable ", "")}</span>`;
    if (typeof durabilityText !== 'undefined') tooltipText += durabilityText;

    if (id.includes("shulker_box")) {
        container.classList.add('shulker-slot');
        tooltipText += `<br><span style="color: gold; font-style: italic;">(Click to view contents)</span>`;

        container.onclick = function () {
            openShulkerBox(id, components);
        };
    }

    if (components && components.value) {
        const componentsData = components.value;

        if (componentsData.display && componentsData.display.value.Name) {
            try {
                const nameJson = JSON.parse(componentsData.display.value.Name.value);
                let txt = "";
                if (typeof nameJson === 'string') txt = nameJson;
                else if (nameJson.text) txt = nameJson.text;
                else if (nameJson.extra) txt = nameJson.extra.map(x => x.text).join('');
                if (txt) tooltipText = `<span style="color:#ff55ff">${txt}</span>`;
            } catch (e) { }
        }

        const potionTag = componentsData['minecraft:potion'] || componentsData["Potion"];
        if (potionTag) {
            const potionName = potionTag.value.replace("minecraft:", "");

            tooltipText += `<br><span style="color: #FF55FF;">${formatName(potionName)}</span>`;
        }

        let enchantsObj = null;
        if (componentsData['minecraft:enchantments'] && componentsData['minecraft:enchantments'].value.levels) {
            enchantsObj = componentsData['minecraft:enchantments'].value.levels.value;
        } else if (componentsData.Enchantments && componentsData.Enchantments.value) {
            const list = componentsData.Enchantments.value.value || componentsData.Enchantments.value;
            if (Array.isArray(list)) {
                list.forEach(ench => {
                    const eId = ench.id.value.replace('minecraft:', '');
                    const eLvl = ench.lvl.value;
                    tooltipText += `<span class="enchant">${formatName(eId)} ${eLvl}</span>`;
                });
            }
        }

        if (enchantsObj) {
            Object.keys(enchantsObj).forEach(key => {
                const enchId = key.replace('minecraft:', '');
                const enchLvl = enchantsObj[key].value;
                tooltipText += `<span class="enchant">${formatName(enchId)} ${enchLvl}</span>`;
            });
        }
    }

    tooltip.innerHTML = tooltipText;
    container.appendChild(tooltip);
}

function openShulkerBox(boxId, components) {
    console.log("Opening Shulker:", boxId);

    const modal = document.getElementById('shulkerModal');
    const title = document.getElementById('shulker-title');
    const grid = document.getElementById('shulker-slots');

    grid.querySelectorAll('.slot').forEach(slot => {
        slot.innerHTML = '';
        slot.removeAttribute('title');
        slot.classList.remove('shulker-slot');
        slot.onclick = null;
    });

    title.innerText = formatName(boxId).replace("Minecraft ", "");

    let items = null;
    const safeValue = (obj) => (obj && obj.value !== undefined) ? obj.value : obj;

    if (components) {
        const data = safeValue(components);

        if (data.BlockEntityTag) {
            const bet = safeValue(data.BlockEntityTag);
            if (bet.Items) {
                items = safeValue(bet.Items);
                console.log("Found Legacy Items");
            }
        }

        if (!items && data['minecraft:container']) {
            let containerRaw = data['minecraft:container'];

            if (containerRaw.value && containerRaw.value.value && Array.isArray(containerRaw.value.value)) {
                items = containerRaw.value.value;
                console.log("Found Modern Items (Deep)");
            }
            else {
                items = safeValue(containerRaw);
                console.log("Found Modern Items (Direct)");
            }
        }

        if (!items && data.tag) {
            const tag = safeValue(data.tag);
            if (tag.BlockEntityTag) {
                const bet = safeValue(tag.BlockEntityTag);
                if (bet.Items) {
                    items = safeValue(bet.Items);
                    console.log("Found Nested Legacy Items");
                }
            }
        }
    }

    if (items && Array.isArray(items)) {
        items.forEach(element => {

            let slotIndex = 0;
            let id = "";
            let count = 0;
            let subComponents = null;

            if (element.item && element.item.value) {
                slotIndex = element.slot.value;
                const itemData = element.item.value;
                id = itemData.id.value.replace(':', '_');
                count = itemData.count ? itemData.count.value : 1;
                subComponents = itemData.components || itemData.tag;
            }
            else {
                slotIndex = element.Slot.value;
                id = element.id.value.replace(':', '_');
                count = element.Count ? element.Count.value : (element.count ? element.count.value : 1);
                subComponents = element.tag || element.components;
            }

            const slotDiv = grid.querySelector(`.slot[data-slot="${slotIndex}"]`);
            if (slotDiv) {
                renderItem(slotDiv, id, count, subComponents);
            }
        });
    } else {
        console.warn("No items found in shulker box structure.");
    }

    modal.style.display = "block";
}

function formatName(str) {
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}