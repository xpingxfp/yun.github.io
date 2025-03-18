import { TemplateYun, page, eventList, menuInstance, shortcut, actionHistoryHandler, yunBox } from "../index.js";

shortcut.addCSSToDoc('path/yuns/dataType/dataType.css');

function createYun() {
    let yun = new TemplateYun();
    let yunBox = page.yunBox;
    yunBox.appendChild(yun.body);
    return yun;
}

function stringYun() {
    let yun = createYun();
    yun.structure.header.data.title.innerHTML = "字符串";
    yun.data.type = "string";
    yun.setPosition(100, 100);
}

function numberYun() {
    let yun = createYun();
    yun.structure.header.data.title.innerHTML = "数值";
    yun.data.type = "number";
    yun.data.value = 0;

    yun.body.addEventListener('Yinput', (e) => {
        let type = e.detail.data.type;
        let value = e.detail.data.value;
        yun.body.classList.remove('error');
        if (type == "number") {
            yun.data.value = value;
            let event = eventList.Yupdataing();
            yun.body.dispatchEvent(event);
        } else {
            yun.body.classList.add('error');
        }
    })

    yun.body.addEventListener("Yupdataing", () => {
        yun.structure.textarea.value = yun.data.value;
        let event = eventList.YupdateComplete();
        yun.body.dispatchEvent(event);
    })

    let textarea = document.createElement('textarea');
    yun.structure.textarea = textarea;
    yun.structure.content.appendChild(textarea);

    textarea.addEventListener('change', () => {
        let value = textarea.value.trim();
        let num = Number(value);
        let isNumUsingNumber = !isNaN(num) && value !== '';
        if (isNumUsingNumber) {
            yun.body.classList.remove('error');
            yun.data.value = num;
            let event = eventList.YupdateComplete();
            yun.body.dispatchEvent(event);
        } else {
            yun.body.classList.add('error');
        }

    });
    return yun;
}

function addNumberYunForPage(e) {
    let yun = numberYun();
    let [x, y] = page.feature.coordinateTransformation(e.clientX, e.clientY);
    yun.setPosition(x, y);

    let undoFunc = () => {
        yun.body.remove();
        actionHistoryHandler.addRedo(redoFunc);
    };

    let redoFunc = () => {
        yunBox.appendChild(yun.body);
        yun.setPosition(x, y);
        actionHistoryHandler.addUndo(undoFunc);
    };

    actionHistoryHandler.addUndo(undoFunc);

    return { undo: undoFunc, redo: redoFunc };
}

let dataType = {
    "数值": addNumberYunForPage
}

let func = menuInstance.setFunc(dataType, "数据类型");
menuInstance.bindingFuncTarget(func);

let Yfunc = {
    "打印信息": () => {
        let targetElement = menuInstance.event.target;
        let ancestorElement = targetElement.closest('.yun');
        ancestorElement.dispatchEvent(eventList.Yhandle((yun) => {
            console.log(yun);
        }));
    },
    "删除": () => {
        let targetElement = menuInstance.event.target;
        let ancestorElement = targetElement.closest('.yun');
        ancestorElement.dispatchEvent(eventList.Ydelete());
    }
}

let funcD = menuInstance.setFunc(Yfunc, "操作");
menuInstance.bindingFuncTarget(funcD, "yun");
