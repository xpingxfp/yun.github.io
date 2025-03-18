
let undos = [];
let redos = [];

let size = 256;

function setSize(siez) {
    size = siez;
}

function addUndo(undo) {
    if (undos.length >= size) {
        undos.shift();
    }
    undos.push(undo)
}

function addRedo(redo) {
    if (redos.length >= size) {
        redos.shift();
    }
    redos.push(redo)
}

function undo() {
    if (undos.length > 0) {
        let func = undos.pop();
        func();
    } else {
        console.log("没有更多可撤销的操作");
    }
}

function redo() {
    if (redos.length > 0) {
        let func = redos.pop();
        func();
    } else {
        console.log("没有更多可重做的操作");
    }
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "Z" || e.code === "KeyZ")) {
        redo();
    } else if (e.ctrlKey && (e.key === "Z" || e.code === "KeyZ")) {
        undo();
    }
});

export let actionHistoryHandler = {
    size,
    undos,
    redos,
    setSize,
    addRedo,
    addUndo,
    undo,
    redo
}


