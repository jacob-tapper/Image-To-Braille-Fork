// Global obfuscation manager
const obfuscators = {
    tasks: [], // { el, codes: Uint16Array, len, idx }
    rafId: null,
};

// Mapping of style codes to CSS rules
const styleMap = {
    "&0": "color:#000",
    "&1": "color:#00a",
    "&2": "color:#0a0",
    "&3": "color:#0aa",
    "&4": "color:#a00",
    "&5": "color:#a0a",
    "&6": "color:#fa0",
    "&7": "color:#aaa",
    "&8": "color:#555",
    "&9": "color:#55f",
    "&a": "color:#5f5",
    "&b": "color:#5ff",
    "&c": "color:#f55",
    "&d": "color:#f5f",
    "&e": "color:#ff5",
    "&f": "color:#fff",
    "&l": "font-weight:bold",
    "&m": "text-decoration:line-through",
    "&n": "text-decoration:underline",
    "&o": "font-style:italic",
};

// --- Obfuscation Setup & Unified RAF Loop ---------------------------------

function clearObfuscators() {
    if (obfuscators.rafId != null) {
        cancelAnimationFrame(obfuscators.rafId);
        obfuscators.rafId = null;
    }
    obfuscators.tasks.length = 0;
}

function addObfuscationTask(el, text) {
    const len = text.length;
    const codes = new Uint16Array(len);
    for (let i = 0; i < len; i++) {
        codes[i] = text.charCodeAt(i);
    }
    obfuscators.tasks.push({ el, codes, len, idx: 0 });
}

function startObfuscationLoop() {
    if (obfuscators.rafId != null) return;

    function tick() {
        const tasks = obfuscators.tasks;
        if (tasks.length === 0) {
            obfuscators.rafId = null;
            return;
        }

        for (let t of tasks) {
            // replace one character with random code 64–95
            const i = t.idx;
            t.codes[i] = 64 + ((Math.random() * 32) | 0);
            // update in one shot
            t.el.textContent = String.fromCharCode.apply(null, t.codes);
            t.idx = (i + 1) % t.len;
        }

        obfuscators.rafId = requestAnimationFrame(tick);
    }

    obfuscators.rafId = requestAnimationFrame(tick);
}

function obfuscate(source, container) {
    if (source.indexOf("<br>") > -1) {
        container.innerHTML = source;
        for (let node of container.childNodes) {
            if (node.nodeType === 3) {
                const span = document.createElement("span");
                span.textContent = node.nodeValue;
                container.replaceChild(span, node);
                addObfuscationTask(span, node.nodeValue);
            }
        }
    } else {
        addObfuscationTask(container, source);
    }
    startObfuscationLoop();
}

// --- Style Application & Parser ------------------------------------------

function applyCode(text, codes) {
    const span = document.createElement("span");

    if (codes.length) {
        let css = "";
        for (let c of codes) {
            css += styleMap[c] + ";";
        }
        span.style.cssText = css;

        if (codes.includes("&k")) {
            obfuscate(text, span);
            return span;
        }
    }

    span.textContent = text;
    return span;
}

function parseStyle(input) {
    const frag = document.createDocumentFragment();
    const len = input.length;
    let active = []; // active codes
    let chunkStart = 0;

    for (let i = 0; i < len; i++) {
        const ch = input[i];

        // Line break: '\n' or literal "\n"
        if (ch === "\n" || (ch === "\\" && input[i + 1] === "n")) {
            if (i > chunkStart)
                frag.appendChild(applyCode(input.slice(chunkStart, i), active));
            
            frag.appendChild(document.createElement("br"));
            if (ch === "\\") i++; // skip 'n'
            chunkStart = i + 1;
            continue;
        }

        // Formatting code: &x
        if (ch === "&" && i + 1 < len) {
            if (i > chunkStart)
                frag.appendChild(applyCode(input.slice(chunkStart, i), active));

            const code = input[i] + input[++i];
            code === "&r" ? active.length = 0 : active.push(code);
            chunkStart = i + 1;
        }
    }

    // flush remaining text
    if (chunkStart < len) {
        frag.appendChild(applyCode(input.slice(chunkStart), active));
    }

    return frag;
}

function initParser(inputId, outputId) {
    const start = performance.now();
    clearObfuscators();
    const input = document.getElementById(inputId).value;
    const output = document.getElementById(outputId);
    output.textContent = "";
    output.appendChild(parseStyle(input));
    const end = performance.now();
    console.log(`Parsing time: ${(end - start).toFixed(3)} milliseconds`);
}
