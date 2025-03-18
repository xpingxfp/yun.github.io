import { FuncComponent } from "../index.js";
import { sideBox, modelSelect } from "../../index.js";

export class SideBox extends FuncComponent {
    constructor(sideBox, modelSelect) {
        super();
        this.sideBox = sideBox;
        this.modelSelect = modelSelect;

        this.init();
    }

    init() {
        this.addEventListener('change', '#model', () => this.updateSideBox());
        this.updateSideBox();
    }

    updateSideBox() {
        this.sideBox.innerHTML = '<div class="loading">加载中...</div>';

        this.sideBox.innerHTML = '';
        const selectedModel = this.modelSelect.value;
        const funcTable = this.funcTables[selectedModel];

        if (!funcTable) return;

        const funcItems = this.buildMenuItem(funcTable);
        funcItems.forEach(item => {
            this.addItem(this.sideBox, item);
        });
    }

    addMode(modeName, funcTable) {
        if (!this.funcTables[modeName]) {
            this.addFuncTable(modeName, funcTable);

            const option = this.createDomElement('option', '', modeName);
            option.value = modeName;
            this.modelSelect.appendChild(option);

            if (this.modelSelect.options.length === 1) {
                this.modelSelect.value = modeName;
                this.updateSideBox();
            }
        }
    }

    setFuncTables(newFuncTables) {
        this.funcTables = newFuncTables;
        this.modelSelect.innerHTML = '';

        Object.keys(this.funcTables).forEach(model => {
            const option = this.createDomElement('option', '', model);
            option.value = model;
            this.modelSelect.appendChild(option);
        });

        this.updateSideBox();
    }
}



