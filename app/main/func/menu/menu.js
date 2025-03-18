import { FuncComponent } from "../index.js";
import { page, menuBox } from "../../index.js";

/**
 * 自定义右键菜单组件。
 * 该类用于创建和管理自定义的上下文菜单，允许将特定的功能实例绑定到目标元素的类名上，并在用户右键点击时显示相应的菜单项。
 */
export class CustomContextMenu extends FuncComponent {
    /**
     * 构造函数，初始化监听器以处理右键点击和普通点击事件。
     */
    constructor() {
        super();
        // 存储与特定类名关联的功能实例列表
        this.funcTargsts = {};
        this.event = null;

        // 监听文档的右键点击事件，触发显示菜单
        document.addEventListener('contextmenu', e => this.showMenu(e));

        // 监听文档的普通点击事件，触发隐藏菜单
        document.addEventListener('click', () => this.hideMenu());
    }

    /**
     * 初始化
     * 检查所有功能实例是否已经绑定到目标类名，如果没有则添加默认绑定。
     */
    init() {
        // 遍历所有的功能实例
        this.funcs.forEach(func => {
            let isBound = false;

            // 检查该功能实例是否已经被绑定到任何目标类名
            for (let targetClass in this.funcTargsts) {
                if (this.funcTargsts[targetClass].includes(func)) {
                    isBound = true;
                    break;
                }
            }

            // 如果没有绑定，则将其绑定到默认目标类名
            if (!isBound) {
                this.bindingFuncTarget(func);
            }
        });
    }

    /**
     * 将功能实例绑定到特定的目标类名。
     * 
     * @param {Func} func - 要绑定的功能实例。
     * @param {string} [targetClass='default'] - 目标类名，默认为 'default'。
     */
    bindingFuncTarget(func, targetClass = 'default') {
        // 如果目标类名不存在，则初始化一个空数组
        if (!this.funcTargsts[targetClass]) {
            this.funcTargsts[targetClass] = [];
        }

        // 将功能实例添加到对应的目标类名列表中
        this.funcTargsts[targetClass].push(func);
    }

    /**
     * 显示菜单。
     * 根据触发元素的类名筛选出需要展示的功能项并添加到菜单中。
     *
     * @param {Event} e - 触发菜单显示的事件对象。
     */
    showMenu(e) {
        e.preventDefault(); // 阻止默认的右键菜单行为
        if (page.state != "free") return;
        this.event = e;
        // 清空之前的菜单内容
        menuBox.innerHTML = '';

        let yunElement = e.target.closest('.yun');
        let targetClassList = yunElement ? yunElement.classList : e.target.classList;

        let orderedMenuItems = [];

        // 根据目标元素的类名筛选功能项
        Object.keys(this.funcTargsts).forEach(type => {
            if (targetClassList.contains(type)) {
                orderedMenuItems.push(...this.funcTargsts[type]);
            }
        });

        // 如果有默认功能项，则添加
        if (this.funcTargsts['default']) {
            orderedMenuItems.push(...this.funcTargsts['default']);
        }

        // 添加筛选后的功能项到菜单
        orderedMenuItems.forEach(func => {
            menuBox.appendChild(func.element);
        });

        // 显示菜单
        this.toggleVisibility(menuBox, true);

        // 设置菜单的位置
        this.setPosition(menuBox, e.pageX, e.pageY);

    }

    /**
     * 隐藏菜单。
     */
    hideMenu() {
        this.toggleVisibility(menuBox, false);
    }

    /**
     * 设置菜单的位置。
     *
     * @param {HTMLElement} menuBox - 菜单容器元素。
     * @param {number} x - X坐标位置。
     * @param {number} y - Y坐标位置。
     */
    setPosition(menuBox, x, y) {
        // 获取窗口的宽度和高度
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 获取menuBox的宽度和高度
        const rect = menuBox.getBoundingClientRect();
        const boxWidth = rect.width;
        const boxHeight = rect.height;

        // 检查并调整x坐标以防止超出左右边界
        if (x < 0) {
            x = 0; // 超出左边界时设置为0
        } else if (x + boxWidth > windowWidth) {
            x = windowWidth - boxWidth; // 超出右边界时调整
        }

        // 检查并调整y坐标以防止超出上下边界
        if (y < 0) {
            y = 0; // 超出上边界时设置为0
        } else if (y + boxHeight > windowHeight) {
            y = windowHeight - boxHeight; // 超出下边界时调整
        }

        // 设置menuBox的位置
        menuBox.style.left = `${x}px`;
        menuBox.style.top = `${y}px`;
    }

    /**
     * 切换菜单的可见性状态。
     *
     * @param {HTMLElement} menuBox - 菜单容器元素。
     * @param {boolean} isVisible - 是否显示菜单。
     */
    toggleVisibility(menuBox, isVisible) {
        menuBox.classList.toggle('hide', !isVisible);
    }
}

export let menuInstance = new CustomContextMenu();
