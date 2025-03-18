import { Dot, Path, pathBox, yunBox, page, eventList, actionHistoryHandler } from "../../../index.js";

let dots = [];

let autoScrollTimer;

function startAutoScroll(element) {
    function autoScroll() {
        if (page.state != 'yunConnect') {
            cancelAnimationFrame(autoScrollTimer);
            return;
        }
        const rect = element.getBoundingClientRect();
        let deltaX = 0, deltaY = 0;
        const distance = 30;
        const scrollSpeedFactor = 0.01;

        if (rect.top < distance) deltaY = (distance - rect.top) * scrollSpeedFactor;
        else if (rect.bottom > window.innerHeight - distance) deltaY = -(rect.bottom - window.innerHeight + distance) * scrollSpeedFactor;

        if (rect.left < distance) deltaX = (distance - rect.left) * scrollSpeedFactor;
        else if (rect.right > window.innerWidth - distance) deltaX = -(rect.right - window.innerWidth + distance) * scrollSpeedFactor;

        if (deltaX !== 0 || deltaY !== 0) {
            page.feature.setPosition(page.data.pos.x + deltaX, page.data.pos.y + deltaY);
            autoScrollTimer = requestAnimationFrame(autoScroll);
        } else {
            cancelAnimationFrame(autoScrollTimer);
        }
    }

    autoScrollTimer = requestAnimationFrame(autoScroll);
}

function handleDotEvents(dot, type) {
    dot.body.addEventListener('mousedown', (e) => {
        if (e.button != 0) return;
        let tempDot = createTempDot();
        yunBox.appendChild(tempDot.body);
        let path = new Path();

        path.setDot(type === 'output' ? dot : tempDot, type === 'input' ? dot : tempDot);
        pathBox.appendChild(path.body);

        let [x, y] = page.feature.coordinateTransformation(e.clientX, e.clientY);
        tempDot.body.style.transform = `translate(${x - 5}px, ${y - 5}px)`;

        let connectOK = false;
        let parentYun = e.target.closest('.yun');
        let supYun = null;
        let subYun = null;

        if (type === 'output') supYun = parentYun;
        page.state = 'yunConnect';

        function up() {
            if (page.state != 'yunConnect') return;
            tempDot.body.remove();
            tempDot = null;
            if (!connectOK) {
                path.remove();
                path = null;
            } else {
                function connectYun(supYun, subYun) {
                    supYun.dispatchEvent(eventList.YaddSubYun(subYun.id));
                    supYun.dispatchEvent(eventList.Yhandle((yun) => {
                        if (!yun.structure.paths) yun.structure.paths = [];
                        addPath(yun.structure.paths, path);
                    }));
                    subYun.dispatchEvent(eventList.Yhandle((yun) => {
                        if (!yun.structure.paths) yun.structure.paths = [];
                        addPath(yun.structure.paths, path);
                    }));

                    function undoFunc() {
                        supYun.dispatchEvent(eventList.YremoveSubYun(subYun.id));
                        supYun.dispatchEvent(eventList.Yhandle((yun) => {
                            removePath(yun.structure.paths, path);
                        }));
                        subYun.dispatchEvent(eventList.Yhandle((yun) => {
                            removePath(yun.structure.paths, path);
                        }));

                        actionHistoryHandler.addRedo(redoFunc);

                        path.body.remove();
                    }

                    function redoFunc() {

                        supYun.dispatchEvent(eventList.YremoveSubYun(subYun.id));
                        supYun.dispatchEvent(eventList.Yhandle((yun) => {
                            addPath(yun.structure.paths, path);
                        }));
                        subYun.dispatchEvent(eventList.Yhandle((yun) => {
                            addPath(yun.structure.paths, path);
                        }));

                        pathBox.appendChild(path.body);
                        actionHistoryHandler.addUndo(undoFunc);
                    }

                    return { undo: undoFunc, redo: redoFunc };
                }

                let { undo } = connectYun(supYun, subYun);
                actionHistoryHandler.addUndo(undo);
            }
            document.removeEventListener('mouseup', up);
            document.removeEventListener('mousemove', move);
            cancelAnimationFrame(autoScrollTimer);
            page.state = 'free';
        }

        function move(e) {
            if (page.state != 'yunConnect') return;
            let [x, y] = page.feature.coordinateTransformation(e.clientX, e.clientY);
            tempDot.body.style.transform = `translate(${x - 5}px, ${y - 5}px)`;
            path.drawThreeBezierLine();

            let yun = e.target.closest('.yun');
            subYun = yun;
            if (yun && yun !== parentYun) {
                let targetDot = yun.querySelector(`.dot.${type === 'input' ? 'output' : 'input'}`);
                let connectedDot = targetDot && dots.find(d => d.body === targetDot);
                if (connectedDot.data.type === "output") {
                    supYun = yun;
                    subYun = parentYun;
                }
                if (connectedDot) {
                    let found = path.setDot(type === 'output' ? dot : connectedDot, type === 'input' ? dot : connectedDot);
                    if (found) return;
                    connectOK = true;
                } else {
                    path.setDot(type === 'output' ? dot : tempDot, type === 'input' ? dot : tempDot);

                    connectOK = false;
                    startAutoScroll(tempDot.body);
                }
            } else {
                path.setDot(type === 'output' ? dot : tempDot, type === 'input' ? dot : tempDot);

                connectOK = false;
                startAutoScroll(tempDot.body);
            }
        }

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    });
}

function addPath(paths, path) {
    paths.push(path);
}

function removePath(paths, pathToRemove) {
    return paths.filter((path) => {
        return path !== pathToRemove;
    });
}

function inputDot() {
    let input = new Dot();
    input.setType("input");
    handleDotEvents(input, 'input');
    dots.push(input);
    return input;
}

function outputDot() {
    let output = new Dot();
    output.setType('output');
    handleDotEvents(output, 'output');
    dots.push(output);
    return output;
}

function createTempDot() {
    let tempDot = new Dot();
    tempDot.setType('temp');
    tempDot.body.style.cursor = 'pointer';
    return tempDot;
}

export function connect(yun) {
    let dotOutput = outputDot();
    let dotInput = inputDot();
    yun.body.appendChild(dotOutput.body);
    yun.body.appendChild(dotInput.body);
    yun.structure.dots = [];
    yun.structure.dots.push(dotInput);
    yun.structure.dots.push(dotOutput);

    yun.body.addEventListener('Ymove', () => {
        if (!yun.structure.paths) return;
        for (let i = 0; i < yun.structure.paths.length; i++) {
            yun.structure.paths[i].updata();
        }
    })
}