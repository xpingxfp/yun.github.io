/**
 * Func 类表示一个基本的功能组件。
 */
export class Func {
    /**
     * 创建一个新的Func实例。
     * @param {string} name - 功能名称。
     * @param {HTMLElement|null} element - 关联的HTML元素，用于在页面上显示。
     * @param {string} type - 功能类型：'item' 或 'table'。
     * @param {object} attributes - 保存其他特定属性的对象，默认为空对象。
     */
    constructor(name, element, type, attributes = {}) {
        this.name = name; // 功能名称
        this.element = element; // 关联的HTML元素
        this.type = type; // 功能类型：'item' 或 'table'
        this.attributes = attributes; // 其他特定属性
        this.attr = this.attributes;
    }

    /**
     * 设置或更新特定属性。
     * @param {string} key - 属性名。
     * @param {*} value - 属性值。
     */
    setAttribute(key, value) {
        this.attributes[key] = value;
    }

    /**
     * 获取特定属性。
     * @param {string} key - 属性名。
     * @returns {*|undefined} 属性值。
     */
    getAttribute(key, defaultValue = null) {
        return this.attributes.hasOwnProperty(key) ? this.attributes[key] : defaultValue;
    }
}

/**
 * FuncItem 类表示功能表中的单个项目。
 */
export class FuncItem {
    /**
     * 创建一个新的功能项实例。
     * @param {string} m_name - 项目名称。
     * @param {function} m_command - 点击项目时要执行的功能（函数）。
     */
    constructor(m_name, m_command) {
        this.name = m_name; // 项目名称
        this.command = m_command; // 点击项目时要执行的功能
        this.element = null; // HTML 元素，初始化为 null
    }

    /**
     * 创建该项目的HTML元素，并设置点击事件。
     * 这个方法会创建一个div元素，设置其文本内容为项目名称，并绑定点击事件来执行命令函数。
     */
    createElement() {
        this.element = document.createElement('div'); // 创建一个 div 元素
        this.element.classList.add('item'); // 添加 'item' 样式类
        this.element.textContent = this.name; // 设置元素文本内容为项目名称
        this.element.onclick = (e) => this.command(e); // 设置点击事件，调用命令函数
    }
}

/**
 * FuncTable 类表示一个包含多个FuncItem的功能表。
 */
export class FuncTable {
    /**
     * 创建一个新的功能表实例。
     * @param {string} m_name - 表名称。
     * @param {object} [m_table={}] - 功能表对象（可选），键是项目名称，值是对应的命令（函数）。
     */
    constructor(m_name, m_table = {}) {
        this.table = m_table; // 功能表对象
        this.name = m_name; // 表名称
        this.element = null; // HTML 元素，初始化为 null
        this.dropdown = null; // 下拉列表元素，初始化为 null
    }

    /**
     * 添加一项到功能表中。
     * @param {string|FuncItem} item - 如果是字符串，则认为是项目名称；如果是FuncItem对象，则直接使用。
     * @param {function} [command] - 当item是字符串时需要提供此参数。
     */
    setItem(item, command) {
        if (typeof item === 'string') {
            if (!command) throw new Error('当第一个参数是字符串时，必须提供第二个参数作为命令');
            this.table[item] = command;
        } else if (item instanceof FuncItem) {
            this.table[item.name] = item.command;
        } else {
            throw new TypeError('无效的参数类型：item 必须是字符串或FuncItem实例');
        }
    }

    /**
     * 根据项目名称或FuncItem实例移除一项。
     * @param {string|FuncItem} itemName - 如果是字符串，则认为是项目名称；如果是FuncItem对象，则直接使用。
     */
    removeItem(itemName) {
        if (typeof itemName === "string") {
            delete this.table[itemName]; // 从表中删除指定名称的项
        } else {
            throw new TypeError('无效的参数类型：itemName 必须是字符串');
        }
    }

    /**
     * 创建该功能表的HTML元素，包括标题和下拉列表。
     * 这个方法会创建一个div元素作为整个功能表容器，其中包含一个span元素作为标题，
     * 和一个div元素作为下拉列表，所有功能项会被添加到这个下拉列表中。
     */
    createElement() {
        this.element = document.createElement('div'); // 创建一个 div 元素
        this.element.classList.add('table'); // 添加 'table' 样式类

        let title = document.createElement('span'); // 创建一个 span 元素用于标题
        title.textContent = this.name; // 设置标题文本内容为表名称
        this.element.appendChild(title); // 将标题添加到表元素中

        this.dropdown = document.createElement('div'); // 创建一个 div 元素用于下拉列表
        this.dropdown.classList.add('dropdown'); // 添加 'dropdown' 和 'hide' 样式类
        this.element.appendChild(this.dropdown); // 将下拉列表添加到表元素中

        for (let key in this.table) {
            let itemElement = new FuncItem(key, this.table[key]); // 创建一个新的功能项
            itemElement.createElement(); // 创建该项的HTML元素
            this.dropdown.appendChild(itemElement.element); // 将该项添加到下拉列表中
        }
    }
}

/**
 * FuncComponent 类管理多个FuncTable和FuncItem实例。
 */
export class FuncComponent {
    constructor() {
        this.funcs = []; // 存储所有功能表和功能项的数组
    }

    /**
    * 添加一个功能表或功能项到组件中。
    * @param {object|FuncTable|function|FuncItem|Func} m_func - 可以是对象、FuncTable实例、函数、FuncItem实例或Func实例。
    * @param {string} [m_name] - 当m_func是对象或函数时需要提供此参数。
    * @returns {Func}
    */
    setFunc(m_func, m_name) {
        let func;
        if (m_func instanceof Func) {
            func = m_func
        } else if (m_func instanceof FuncTable) {
            m_func.createElement();
            const attributes = {
                dropdown: m_func.dropdown,
                table: m_func.table
            };
            func = new Func(m_func.name, m_func.element, 'table', attributes);
        } else if (m_func instanceof FuncItem) {
            m_func.createElement();
            const attributes = { command: m_func.command };
            func = new Func(m_func.name, m_func.element, 'item', attributes);
        } else if (typeof m_func === 'object') {
            if (!m_name) throw new Error('当第一个参数是对象时，必须提供第二个参数作为名称');
            const tableInstance = new FuncTable(m_name, m_func);
            tableInstance.createElement();
            const attributes = {
                dropdown: tableInstance.dropdown,
                table: m_func
            };
            func = new Func(m_name, tableInstance.element, 'table', attributes);
        } else if (typeof m_func === 'function') {
            if (!m_name) throw new Error('当第一个参数是函数时，必须提供第二个参数作为名称');
            const itemInstance = new FuncItem(m_name, m_func);
            itemInstance.createElement();
            const attributes = { command: m_func };
            func = new Func(m_name, itemInstance.element, 'item', attributes);
        } else {
            throw new TypeError('无效的参数类型：m_func 必须是对象、FuncTable实例、函数或FuncItem实例');
        }

        this.funcs.push(func);
        return func;
    }

    /**
     * 根据名称移除指定的功能表或功能项。
     * @param {string} name - 移除功能表或功能项的名称。
     */
    removeFunc(name) {
        this.funcs = this.funcs.filter(func =>
            func.name !== name
        ); // 过滤掉名称匹配的表或项
    }

    /**
     * 根据名称、实例、对象或函数获取指定的功能表或功能项。
     * @param {string|object|FuncTable|FuncItem|function} identifier - 要获取的功能表或功能项的名称、实例、对象或函数。
     * @returns {Func|null} 返回找到的Func实例，如果没有找到则返回null。
     */
    getFunc(identifier) {
        if (typeof identifier === 'string') {
            return this.funcs.find(func => func.name === identifier) || null;
        } else if (identifier instanceof FuncTable || identifier instanceof FuncItem) {
            return this.funcs.find(func =>
                (func.type === 'table' && func.attributes.table === identifier.table) ||
                (func.type === 'item' && func.attributes.command === identifier.command)
            ) || null;
        } else if (typeof identifier === 'object') {
            return this.funcs.find(func => func.type === 'table' && func.attributes.table == identifier) || null;
        } else if (typeof identifier === 'function') {
            return this.funcs.find(func => func.type === 'item' && func.attributes.command === identifier) || null;
        } else {
            throw new TypeError('无效的参数类型：identifier 必须是字符串、FuncTable实例、FuncItem实例、对象或函数');
        }
    }
}