import { baseBoard, yunBox, posB, scaleB } from "./index.js";

export let page = {
    data: { pos: { x: 0, y: 0 }, scale: 1 },
    baseBoard: baseBoard,
    yunBox: yunBox,
    state: "free",
    feature: {
        setPosition,
        setScale,
        coordinateTransformation
    }
}

function coordinateTransformation(x, y) {
    return [(x - page.data.pos.x) / page.data.scale,
    (y - page.data.pos.y) / page.data.scale];
}

function setPosition(x, y) {
    page.data.pos.x = x;
    page.data.pos.y = y;
    posB.style.transform = `translate(${page.data.pos.x}px, ${page.data.pos.y}px)`;
}

function setScale(scale) {
    page.data.scale = scale;
    scaleB.style.transform = `scale(${page.data.scale})`;
}

// 移动
baseBoard.addEventListener('mousedown', e => {
    if (e.button == 1) {
        let mouseStopTimeout;
        const startX = e.clientX;
        const startY = e.clientY;
        const startPosX = page.data.pos.x;
        const startPosY = page.data.pos.y;

        const moveHandler = e => {
            page.state = 'move';
            clearTimeout(mouseStopTimeout);
            mouseStopTimeout = setTimeout(() => {
                page.state = 'free';
            }, 100);
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            setPosition(startPosX + dx, startPosY + dy)
        };

        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    };
});

// 缩放逻辑
baseBoard.addEventListener('wheel', e => {
    if (page.state != 'free') return;
    if (e.ctrlKey) return;
    if (e.target.closest('.yun')) return;
    e.preventDefault();

    // 调整缩放方向判断
    const zoomDirection = Math.sign(e.deltaY) > 0 ? -1 : 1;
    const zoomFactor = e.shiftKey ? 0.01 : 0.1;
    const newScale = Math.max(0.1, Math.min(page.data.scale + zoomDirection * zoomFactor, 10));

    const rect = baseBoard.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 计算新位置
    const deltaX = (1 - newScale / page.data.scale) * (mouseX - page.data.pos.x);
    const deltaY = (1 - newScale / page.data.scale) * (mouseY - page.data.pos.y);

    // 应用变换
    setPosition(page.data.pos.x + deltaX, page.data.pos.y + deltaY);
    setScale(newScale);
}, { passive: false });

