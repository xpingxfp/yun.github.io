import { Yun, element } from "../index.js";

export class TemplateYun extends Yun {
    constructor() {
        super();
        this.structure = {
            box: null,
            header: element.create.header(),
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
        // element.func.yun.zoom(this);
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

