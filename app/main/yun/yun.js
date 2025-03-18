const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = '/app/main/yun/yun.css';
document.head.appendChild(style);

// 随机id
function generateRandomId() {
    const timestamp = new Date().getTime().toString(36);
    const randomPart = (Math.random() * 36 ** 9 << 0).toString(36);
    return `N${timestamp}${randomPart}`;
}


let yuns = [];

// 节点类
export class Yun {
    constructor() {
        this.data = { pos: { x: 0, y: 0 }, scale: 1, size: { width: 100, height: 100 } };
        this.subYuns = [];
        this.body = null;
        this.state = 'free';
        this.content = {};
        yuns.push(this);
    }

    /**
     * 设置尺寸
     * @param {number} w - 宽度
     * @param {number} h - 高度
     */
    setSize(w, h) {
        if (w < 50) w = 50;
        if (h < 25) h = 25;
        this.data.size.width = w;
        this.data.size.height = h;
        this.body.style.width = `${this.data.size.width}px`;
        this.body.style.height = `${this.data.size.height}px`;
    }

    /**
     * 设置位置
     * @param {number} x - X轴位置
     * @param {number} y - Y轴位置
     */
    setPosition(x, y) {
        this.data.pos.x = x;
        this.data.pos.y = y;
        this.body.style.transform = `translate(${this.data.pos.x}px, ${this.data.pos.y}px)`;
    }

    // 创建云
    createYun() {
        this.body = document.createElement('div');
        this.body.id = generateRandomId();
        this.body.classList.add('yun');
        this.#eventDetection();
    }

    /**
     * 设置节点ID
     * @param {string} id - 节点的唯一标识符
     */
    setID(id) {
        this.body.id = id;
    }

    /**
     * 添加子节点
     * @param {id} id - 目标id
     * @param {HTMLElement} element - 要添加的子节点元素
     */
    addSubYun(id, element) {
        this.subYuns.push([id, element]);
    }

    remove() {
        for (let i = 0; i < yuns.length; i++) {
            for (let j = 0; j < yuns[i].subYuns.length; j++) {
                if (yuns[i].subYuns[j][0] == this.body.id) {
                    yuns[i].body.dispatchEvent(new CustomEvent("YremoveSubYun", { detail: this.body.id }));
                    break;
                }
            }
        };
        this.subYuns = [];
        if (this.body && this.body.parentNode) {
            this.body.parentNode.removeChild(this.body);
        }
        this.body = null;
    }

    // 事件检测
    #eventDetection() {
        let yun = this;
        this.body.addEventListener('Ychecked', () => {
            this.body.classList.add('checked');
        })

        this.body.addEventListener('YcheckedRemove', () => {
            this.body.classList.remove('checked');
        })

        this.body.addEventListener('mousedown', (e) => {
            if (e.button != 0) return;
            let checkedEvent = new CustomEvent("Ychecked");
            this.body.dispatchEvent(checkedEvent);
            if (e.ctrlKey) return;
            let checkedYuns = document.querySelectorAll('.checked');
            let checkedRemoveEvent = new CustomEvent("YcheckedRemove");
            for (let yun of checkedYuns) {
                yun.dispatchEvent(checkedRemoveEvent);
            }
            this.body.dispatchEvent(checkedEvent);
        })

        this.body.addEventListener('Ymove', (e) => {
            this.setPosition(this.data.pos.x + e.detail.dx, this.data.pos.y + e.detail.dy);
        })

        this.body.addEventListener("Yhandle", (e) => {
            e.detail(yun);
        });

        this.body.addEventListener("Ydelete", function () {
            yun.remove();
        });

        this.body.addEventListener("YaddSubYun", function (e) {
            let subYun = document.querySelector(`#${e.detail}`);
            yun.addSubYun(e.detail, subYun);
            let event = new CustomEvent("Yupdate", { detail: yun.body.id });
            subYun.dispatchEvent(event);
        });

        this.body.addEventListener("YremoveSubYun", function (e) {
            for (let i = 0; i < this.subYuns.length; i++) {
                if (this.subYuns[i][0] === e.detail) {
                    this.subYuns.splice(i, 1);
                    break;
                }
            }
        }.bind(this));

        addEventListener("NinputOff", function (e) { });
        addEventListener("Noutput", function (e) { });

        // 自行处理，建议用于数据处理
        addEventListener("Yinput", function () { });

        this.body.addEventListener("YgetData", function (e) {
            let supYun = document.querySelector(`#${e.detail}`);
            let event = new CustomEvent("YputData", { detail: yun.body.id });
            supYun.dispatchEvent(event);
        });

        this.body.addEventListener("YputData", function (e) {
            let index = yun.subYuns.findIndex(subArray => subArray[0] === e.detail);
            let sub = yun.subYuns[index][1];
            let event = new CustomEvent("Yinput", { detail: { data: yun.data } });
            sub.dispatchEvent(event);
        });

        this.body.addEventListener("Yupdate", function (e) {
            let supYun = document.querySelector(`#${e.detail}`);
            let event = new CustomEvent("YputData", { detail: yun.body.id });
            supYun.dispatchEvent(event);
        });

        // 自行处理，建议用于应用变化
        addEventListener("Yupdating", function () { });

        this.body.addEventListener("YupdateComplete", function () {
            for (let i = 0; i < yun.subYuns.length; i++) {
                let subYun = yun.subYuns[i][1];
                let event = new CustomEvent("Yupdate", { detail: yun.body.id });
                subYun.dispatchEvent(event);
            }
        });
        addEventListener("Nloop", function (e) { });
        addEventListener('NchangeState', (e) => { });
    }

}




