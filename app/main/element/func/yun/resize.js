import { page, actionHistoryHandler } from "../../../index.js";
function createResizer(yun, options) {
    const resizer = document.createElement("div");
    resizer.classList.add("resize", ...options.classes);
    yun.body.appendChild(resizer);

    let resizeListener = null;
    let upListener = null;

    function startResize(event) {
        if (event.button !== 0) return;
        event.preventDefault();

        const startPos = { x: event.clientX, y: event.clientY };
        const startSize = { w: yun.data.size.width, h: yun.data.size.height };
        let [newWidth, newHeight] = [];

        resizeListener = (e) => {
            const offset = {
                x: (e.clientX - startPos.x) / page.data.scale,
                y: (e.clientY - startPos.y) / page.data.scale
            };
            newWidth = startSize.w + (options.resizeX ? offset.x : 0);
            newHeight = startSize.h + (options.resizeY ? offset.y : 0);
            yun.setSize(newWidth, newHeight);
            yun.body.classList.add('resizing');
        };

        upListener = () => {
            yun.body.classList.remove('resizing');
            document.removeEventListener("mousemove", resizeListener);
            document.removeEventListener("mouseup", upListener);
            function undoFunc() {
                yun.setSize(startSize.w, startSize.h)
                actionHistoryHandler.addRedo(redoFunc);
                if (!yun.structure.paths) return;
                for (let i = 0; i < yun.structure.paths.length; i++) {
                    yun.structure.paths[i].updata();
                }
            }

            function redoFunc() {
                yun.setSize(newWidth, newHeight);
                actionHistoryHandler.addUndo(undoFunc);
                if (!yun.structure.paths) return;
                for (let i = 0; i < yun.structure.paths.length; i++) {
                    yun.structure.paths[i].updata();
                }
            }

            actionHistoryHandler.addUndo(undoFunc);
            if (!yun.structure.paths) return;
            for (let i = 0; i < yun.structure.paths.length; i++) {
                yun.structure.paths[i].updata();
            }

        };

        // 防止鼠标抖动
        setTimeout(() => {
            document.addEventListener("mousemove", resizeListener);
            document.addEventListener("mouseup", upListener);
        }, 50);
    }

    resizer.addEventListener('mousedown', startResize);

    return {
        destroy: () => {
            resizer.removeEventListener('mousedown', startResize);
            if (resizeListener) {
                document.removeEventListener("mousemove", resizeListener);
            }
            if (upListener) {
                document.removeEventListener("mouseup", upListener);
            }
            yun.body.removeChild(resizer);
        }
    };
}
/** 
 * @param {Yun} yun
 * @returns {function} destroy
 */
export function resize(yun) {
    const resizers = [
        { classes: ["corner", "bottom", "right"], resizeX: true, resizeY: true },
        { classes: ["horizontal", "bottom"], resizeX: false, resizeY: true },
        { classes: ["vertical", "right", "top"], resizeX: true, resizeY: false }
    ];

    const resizerInstances = resizers.map(options => createResizer(yun, options));

    return function destroy() {
        resizerInstances.forEach(resizer => resizer.destroy());
    }
}