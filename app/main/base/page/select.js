import { baseBoard } from "./index.js";

export let selectBox;
let appendTimeout;
// 选择
baseBoard.addEventListener('mousedown', e => {
    if (e.button == 0 && !document.querySelector("#selectBox")) {
        let yunElement = e.target.closest('.yun');
        if (yunElement) return;

        clearTimeout(appendTimeout);
        appendTimeout = setTimeout(() => {
            if (!selectBox) {
                selectBox = document.createElement("div");
                selectBox.id = "selectBox";
            }
            let startX = e.clientX;
            let startY = e.clientY;
            document.body.appendChild(selectBox);
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);

            function move(e) {
                let endX = e.clientX;
                let endY = e.clientY;
                let width = Math.abs(endX - startX);
                let height = Math.abs(endY - startY);
                let left = Math.min(startX, endX);
                let top = Math.min(startY, endY);
                selectBox.style.width = width + "px";
                selectBox.style.height = height + "px";
                selectBox.style.left = left + "px";
                selectBox.style.top = top + "px";
            }

            function up() {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
                let yuns = baseBoard.querySelectorAll(".yun");
                for (let i = 0; i < yuns.length; i++) {
                    let yun = yuns[i];
                    if (!e.ctrlKey) {
                        let checkedRemoveEvent = new CustomEvent("YcheckedRemove");
                        yun.dispatchEvent(checkedRemoveEvent);
                    }
                    let yunrect = yun.getBoundingClientRect();
                    let yunLeft = yunrect.left;
                    let yunRight = yunrect.right;
                    let yunTop = yunrect.top;
                    let yunBottom = yunrect.bottom;
                    let selectLeft = selectBox.offsetLeft;
                    let selectTop = selectBox.offsetTop;
                    let selectRight = selectLeft + selectBox.offsetWidth;
                    let selectBottom = selectTop + selectBox.offsetHeight;
                    if (
                        yunLeft >= selectLeft &&
                        yunRight <= selectRight &&
                        yunTop >= selectTop &&
                        yunBottom <= selectBottom
                    ) {
                        let checkedEvent = new CustomEvent("Ychecked");
                        yun.dispatchEvent(checkedEvent);
                    }
                }
                selectBox.style = "";
                selectBox.remove();
            }
        }, 50)
    }
})