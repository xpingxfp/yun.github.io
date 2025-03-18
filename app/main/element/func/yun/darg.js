import { page, ghostElement, actionHistoryHandler, shortcut } from "../../../index.js";

function updateGhostSizeAndPosition(width, height, x, y) {
    ghostElement.style.width = `${width}px`;
    ghostElement.style.height = `${height}px`;
    ghostElement.style.transform = `translate(${x}px, ${y}px) scale(${page.data.scale})`;
}

let autoScrollTimer;

function startAutoScroll() {
    function autoScroll() {
        if (page.state != 'yunMove') {
            cancelAnimationFrame(autoScrollTimer);
            return;
        }

        const rect = ghostElement.getBoundingClientRect();
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
/** 
 * @param {Yun} yun
 * @returns {function} destroy
 */
export function draggable(yun) {
    function mouseDownHandler(e) {
        if (e.button !== 0) return;
        if (yun.state != 'free') return;

        let initialPos = {
            x: yun.data.pos.x * page.data.scale + page.data.pos.x,
            y: yun.data.pos.y * page.data.scale + page.data.pos.y,
        };

        let startPos = { x: e.clientX, y: e.clientY };
        let pageStartPos = { x: page.data.pos.x, y: page.data.pos.y };
        let offset = { x: 0, y: 0 };

        page.state = 'yunMove';

        function mouseMoveHandler(e) {
            if (page.state != 'yunMove') return;
            ghostElement.style.display = 'block';
            yun.body.classList.add('moveing');

            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;

            let newX = initialPos.x + dx;
            let newY = initialPos.y + dy;

            // 添加边界检查
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX > window.innerWidth - yun.body.offsetWidth * page.data.scale)
                newX = window.innerWidth - yun.body.offsetWidth * page.data.scale;
            if (newY > window.innerHeight - yun.body.offsetHeight * page.data.scale)
                newY = window.innerHeight - yun.body.offsetHeight * page.data.scale;

            updateGhostSizeAndPosition(
                yun.body.offsetWidth,
                yun.body.offsetHeight,
                newX,
                newY
            );
            offset.x = newX - initialPos.x;
            offset.y = newY - initialPos.y;
            startAutoScroll();
        }

        function mouseUpHandler(e) {
            if (page.state != 'yunMove') return;

            if (e.button == 0) {
                let checkedyuns = document.querySelectorAll(".checked");
                function moveYun(dx, dy) {
                    let moveEvent = new CustomEvent("Ymove", { detail: { dx, dy } });
                    for (let i = 0; i < checkedyuns.length; i++) {
                        checkedyuns[i].dispatchEvent(moveEvent);
                    }

                    function undoFunc() {
                        moveYun(-dx, -dy);
                        actionHistoryHandler.addRedo(redoFunc)
                    }

                    function redoFunc() {
                        moveYun(dx, dy);
                        actionHistoryHandler.addUndo(undoFunc)
                    }

                    return { undo: undoFunc, redo: redoFunc };

                }
                let [dx, dy] = [(offset.x + pageStartPos.x - page.data.pos.x) / page.data.scale, (offset.y + pageStartPos.y - page.data.pos.y) / page.data.scale]

                let { undo } = moveYun(dx, dy)
                actionHistoryHandler.addUndo(undo);
            }
            page.state = 'free';
            ghostElement.style.display = 'none';
            yun.body.classList.remove('moveing');
            document.removeEventListener('mousemove', shortcut.debounce((e) => { mouseUpHandler(e) }, 100));
            document.removeEventListener('mouseup', mouseUpHandler);
            cancelAnimationFrame(autoScrollTimer);
        }

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }

    yun.body.addEventListener('mousedown', mouseDownHandler);

    return function destroy() {
        if (!yun.body) return;
        yun.body.removeEventListener('mousedown', mouseDownHandler);
    };
}