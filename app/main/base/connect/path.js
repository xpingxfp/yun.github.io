import { page, svgBox, pathBox } from "../index.js";

let paths = [];

export class Path {
    constructor() {
        this.body = null;
        this.data = {
            d: '',
            fill: 'none',
            stroke: 'black',
            strokeWidth: 2,
            dot: { start: null, end: null },
        }
        this.pattern = null;
        paths.push(this);
        this.init();
    }

    init() {
        this.createPath();
    }

    createPath() {
        if (this.body) return;
        this.body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.body.setAttribute('class', 'path');
    }

    setDot(start, end) {
        let found = false;
        for (let i = 0; i < paths.length; i++) {
            if (start == paths[i].data.dot.start && end == paths[i].data.dot.end) {
                found = true;
                break;
            }
        }
        if (!found) {
            this.data.dot.start = start;
            this.data.dot.end = end;
        }
        return found;
    }

    draw() {
        this.updateBox();
        this.body.setAttribute('d', this.data.d);
        this.body.setAttribute('fill', this.data.fill);
        this.body.setAttribute('stroke', this.data.stroke);
        this.body.setAttribute('stroke-width', this.data.strokeWidth);
    }

    getDotPos() {
        const { scale, pos: { x, y } } = page.data;
        const getAdjustedPos = (rect) => {
            return {
                x: (rect.left + rect.width / 2 - x) / scale,
                y: (rect.top + rect.height / 2 - y) / scale
            };
        };

        const startRect = this.data.dot.start.body.getBoundingClientRect();
        const endRect = this.data.dot.end.body.getBoundingClientRect();

        return [
            getAdjustedPos(startRect).x,
            getAdjustedPos(startRect).y,
            getAdjustedPos(endRect).x,
            getAdjustedPos(endRect).y
        ];
    }

    drawLine() {
        let [startX, startY, endX, endY] = this.getDotPos();
        let d = `M ${startX} ${startY} L ${endX} ${endY}`;
        this.data.d = d;
        this.pattern = "line"
        this.draw();
    }

    drawThreeBezierLine() {
        let [startX, startY, endX, endY] = this.getDotPos();
        let xDifference = Math.abs(endX - startX);

        let d = `M ${startX} ${startY} C 
        ${startX + xDifference / 2} ${startY} 
        ${endX - xDifference / 2} ${endY} 
        ${endX} ${endY}`;

        this.data.d = d;
        this.pattern = "bezier"
        this.draw();
    }

    updata() {
        setTimeout(() => {
            if (this.pattern == "bezier") {
                this.drawThreeBezierLine();
            } else if (this.pattern == "line") {
                this.drawLine();
            }
        }, 100);
    }

    updateBox() {
        let [left, top, right, bottom] = this.getDotPos();
        if (left > right) [left, right] = [right, left];
        if (top > bottom) [top, bottom] = [bottom, top];

        let buffer = (right - left) * 0.1 + 100;
        left -= buffer;
        right += buffer;
        top -= buffer;
        bottom += buffer;

        if (left < svgBox.bounds.left) svgBox.bounds.left = left;
        if (top < svgBox.bounds.top) svgBox.bounds.top = top;
        if (right > svgBox.bounds.right) svgBox.bounds.right = right;
        if (bottom > svgBox.bounds.bottom) svgBox.bounds.bottom = bottom;

        let width = svgBox.bounds.right - svgBox.bounds.left;
        let height = svgBox.bounds.bottom - svgBox.bounds.top;

        pathBox.setAttribute('viewBox', `${svgBox.bounds.left} ${svgBox.bounds.top} ${width} ${height}`);

        svgBox.style.width = `${width}px`;
        svgBox.style.height = `${height}px`;
        svgBox.style.left = `${svgBox.bounds.left}px`;
        svgBox.style.top = `${svgBox.bounds.top}px`;
    }

    remove() {
        const index = paths.indexOf(this);
        if (index > -1) {
            paths.splice(index, 1);
        }

        if (this.body && this.body.parentNode) {
            this.body.parentNode.removeChild(this.body);
        }

        this.body = null;
        this.data = null;
        this.pattern = null;
    }
}