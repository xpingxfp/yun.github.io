import { Yun, menuInstance } from '../index.js';

let yunBox = document.querySelector("#yunBox");

function createYun() {
    let yun = new Yun();

    yun.createYun();

    yunBox.appendChild(yun.body);

    return yun;
}

function canvasYun() {
    let yun = createYun();

    let canvas = document.createElement('canvas');
    yun.body.appendChild(canvas);

    let ctx = canvas.getContext('2d');
}

function tensorYun() {
    let yun = createYun();

    yun.body.classList.add('Ntensor');
}

function arrayYun() {
    let yun = createYun();

    yun.body.classList.add('Narray');

    yun.data.array = [];

    let textarea = document.createElement('textarea');
    textarea.value = JSON.stringify(yun.data.array, null, 2);
    textarea.addEventListener("change", () => {
        try {
            let newArray = JSON.parse(textarea.value);
            if (Array.isArray(newArray)) {
                yun.data.array = newArray;
                // console.log('Updated array:', yun.data.array);
            } else {
                console.error('Input is not a valid array.');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });

    yun.body.appendChild(textarea);
}

let allDataMenuFuncTable = {
    '数组': arrayYun,
}
