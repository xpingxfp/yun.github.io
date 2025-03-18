/** 不能实现撤销和重做功能 */
import { actionHistoryHandler } from "../../../index.js";
/** 
 * @param {Yun} yun
 * @returns {function} destroy
 */
export function zoom(yun) {
    function wheelHandler(e) {
        e.preventDefault();

        const zoomDirection = Math.sign(e.deltaY) > 0 ? -1 : 1;
        const zoomFactor = e.shiftKey ? 0.01 : 0.1;
        const newScale = Math.max(0.1, Math.min(yun.data.scale + zoomDirection * zoomFactor, 10));

        let size = {
            w: yun.data.size.width * newScale,
            h: yun.data.size.height * newScale,
        }

        yun.setSize(size.w, size.h);
        if (!yun.structure.paths) return;
        for (let i = 0; i < yun.structure.paths.length; i++) {
            yun.structure.paths[i].updata();
        }
    }

    document.addEventListener("keydown", (e) => {
        if (!e.ctrlKey) return;
        let startSize = {
            w: yun.data.size.width,
            h: yun.data.size.height
        }
        yun.body.addEventListener('wheel', wheelHandler);

        document.addEventListener("keyup", (e) => {
            yun.body.removeEventListener('wheel', wheelHandler);
            let newSize = {
                w: yun.data.size.width,
                h: yun.data.size.height
            }

            function undoFunc() {
                yun.setSize(startSize.w, startSize.h);
                actionHistoryHandler.addRedo(redoFunc);
            }

            function redoFunc() {
                yun.setSize(newSize.w, newSize.h);
                actionHistoryHandler.addUndo(undoFunc);
            }

            // actionHistoryHandler.addUndo(undoFunc);
        })
    })

    return function destroy() {
        yun.body.removeEventListener('wheel', wheelHandler);
    };
}

