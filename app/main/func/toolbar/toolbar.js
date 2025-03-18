import { FuncComponent } from "../index.js";
import { toolBox } from "../../index.js";
export class Toolbar extends FuncComponent {
    constructor() {
        super();
        this.toolBox = toolBox;
        this.isInitialized = false; // 标志位，用于跟踪是否已初始化
        this.clickHandler = (e) => { // 定义全局点击事件处理函数
            if (!e.target.closest('.funcTable')) {
                this.hideAllDropdowns();
            }
        };
    }
    /** 初始化 */
    init() {
        // 检查 toolBox 是否存在
        if (!this.toolBox) {
            console.error("Toolbox element not found.");
            return;
        }

        // 确保 funcs 存在且不为空
        if (!Array.isArray(this.funcs) || this.funcs.length === 0) {
            console.warn("No funcs provided.");
            return;
        }

        // 如果已经初始化过，则先清理之前的设置
        if (this.isInitialized) {
            this.cleanup();
        }

        // 添加全局点击事件监听器
        document.addEventListener('click', this.clickHandler);

        // 遍历所有的 funcs 并初始化它们
        this.funcs.forEach((funcTable) => {
            // 创建元素并添加到 toolBox 中
            this.toolBox.appendChild(funcTable.element);

            // 添加点击事件监听器，阻止冒泡并切换下拉菜单状态
            funcTable.element.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡到document
                this.toggleDropdown(funcTable);
            });
        });

        // 设置初始化标志位为 true
        this.isInitialized = true;
    }

    // 清理之前的设置
    cleanup() {
        // 移除全局点击事件监听器
        document.removeEventListener('click', this.clickHandler);

        // 移除所有已添加的功能表元素
        this.funcs.forEach((funcTable) => {
            if (funcTable.element && funcTable.element.parentNode) {
                funcTable.element.parentNode.removeChild(funcTable.element);
            }
        });

        // 隐藏所有 dropdowns
        this.hideAllDropdowns();
    }

    // 隐藏所有dropdowns的方法
    hideAllDropdowns() {
        this.funcs.forEach((funcTable) => {
            if (funcTable.attributes.dropdown) {
                funcTable.element.classList.add('close');
                funcTable.element.classList.remove('open');
                funcTable.attributes.dropdown.classList.add('hide');
            }
        });
    }

    // 切换指定funcTable的dropdown状态
    toggleDropdown(funcTable) {
        this.hideAllDropdowns(); // 先隐藏所有dropdowns
        if (funcTable.attributes.dropdown) {
            funcTable.element.classList.add('open');
            funcTable.element.classList.remove('close');
            funcTable.attributes.dropdown.classList.toggle('hide')
        }; // 再切换目标dropdown的状态
    }
}

export let toolBarInstance = new Toolbar();

