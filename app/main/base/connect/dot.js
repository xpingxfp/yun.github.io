export class Dot {
    constructor() {
        this.body = null;
        this.data = {
            type: null,
        };
        this.init();
    }

    init() {
        this.create();
    }

    create() {
        this.body = document.createElement('div');
        this.body.classList.add('dot');
    }

    setType(type) {
        this.data.type = type;
        this.body.classList.add(type);
    }
}