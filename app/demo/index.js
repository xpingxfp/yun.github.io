import { Yun, page, element, menuInstance, eventList } from "../main/index.js";

// 已经在"path/yuns/TemplateYun/"中添加"
class TemplateYun extends Yun {
    constructor() {
        super();
        this.structure = {
            /** @type {HTMLDivElement} */
            box: null,
            /** @type {HTMLDivElement} */
            header: element.create.header(),
            /** @type {HTMLDivElement} */
            content: null,
        };
        this.init();
    }

    init() {
        this.createYun();
        this.createBox();
        this.structure.box.appendChild(this.structure.header);
        this.createContentBox();
        this.drag();
        this.event();
        element.func.yun.zoom(this);
        element.func.yun.resize(this);
        element.func.yun.connect(this);
    }

    createBox() {
        this.structure.box = document.createElement('div');
        this.structure.box.classList.add('box');
        this.body.appendChild(this.structure.box);
    }

    createContentBox() {
        this.structure.content = document.createElement('div');
        this.structure.content.classList.add('content');
        this.structure.box.appendChild(this.structure.content);
    }

    drag() {
        this.structure.header.addEventListener('mousedown', () => {
            let destroyDraggable = element.func.yun.draggable(this);
            document.addEventListener('mouseup', destroyDraggable)
        })
    }

    event() {
        let yun = this;
        element.func.HTMLelement.edit.dblclickEdit(this.structure.header.data.title, (e) => {
            if (e.state == "editing") {
                yun.state = 'changeTitle';
            } else if (e.state == "edited") {
                yun.state = 'free';
            }
        });
    }
}

let yuns = [];

let menu = {
    "打印信息": () => {
        let targetElement = menuInstance.event.target;
        let ancestorElement = targetElement.closest('.yun');
        ancestorElement.dispatchEvent(eventList.Yhandle((yun) => {
            console.log(yun);
        }));
    },
}

let func = menuInstance.setFunc(menu, "测试");
menuInstance.bindingFuncTarget(func, "yun");

let menuD = {
    "创建yun": (e) => {
        let yun = new TemplateYun();
        let yunBox = page.yunBox;
        let [x, y] = page.feature.coordinateTransformation(e.clientX, e.clientY);
        yun.setPosition(x, y);
        yun.structure.content.setAttribute("contenteditable", "plaintext-only");
        yunBox.appendChild(yun.body);
        yuns.push(yun);
    }
}

let funcD = menuInstance.setFunc(menuD, "测试");
menuInstance.bindingFuncTarget(funcD);

function createYun() {
    let yun = new TemplateYun();
    let yunBox = page.yunBox;
    yunBox.appendChild(yun.body);
    return yun;
}

// 已经在"path/yuns/dataType/"中添加"
function numberYun() {
    let yun = createYun();
    yun.structure.header.data.title.innerHTML = "数值";
    yun.data.type = "number";
    yun.data.value = 0;

    // Yinput事件，建议用于处理数据
    yun.body.addEventListener('Yinput', (e) => {
        let type = e.detail.data.type;
        let value = e.detail.data.value;
        yun.body.classList.remove('error');
        if (type == "number") {
            yun.data.value = value;
            // 处理完成向自己传递更新中事件
            let event = eventList.Yupdataing();
            yun.body.dispatchEvent(event);
        } else {
            yun.body.classList.add('error');
        }
    })

    // Yupdataing事件，建议用于应用变化
    yun.body.addEventListener("Yupdataing", () => {
        yun.structure.textarea.value = yun.data.value;
        // 修改完成向自己传递更新完毕事件
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
            // 修改完成向自己传递更新完毕事件
            let event = eventList.YupdateComplete();
            yun.body.dispatchEvent(event);
        } else {
            yun.body.classList.add('error');
        }

    });
    return yun;
}

let dataType = {
    "数值": (e) => {
        let yun = numberYun();
        let [x, y] = page.feature.coordinateTransformation(e.clientX, e.clientY);
        yun.setPosition(x, y);
    }
}

