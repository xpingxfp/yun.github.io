// 创建baseBoard结构
export let baseBoard = document.createElement('div');
baseBoard.id = 'baseBoard';
document.body.appendChild(baseBoard);

// 坐标
export let posB = document.createElement('div');
posB.className = 'posN';
posB.style.willChange = 'transform';
baseBoard.appendChild(posB);

// 缩放
export let scaleB = document.createElement('div');
scaleB.className = 'scaleN';
scaleB.style.transformOrigin = '0 0';
scaleB.style.willChange = 'transform';
posB.appendChild(scaleB);

// yunbox
export let yunBox = document.createElement('div');
yunBox.id = 'yunBox';
scaleB.appendChild(yunBox);

export let svgBox = document.createElement('div');
svgBox.bounds = { left: 0, top: 0, right: 1000, bottom: 1000 };
svgBox.id = 'svgBox';
yunBox.appendChild(svgBox);

export let pathBox = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
pathBox.id = 'pathBox';
pathBox.setAttribute('width', '100%');
pathBox.setAttribute('height', '100%');
svgBox.appendChild(pathBox);

// 右键菜单
export let menuBox = document.createElement('div');
menuBox.id = "menuBox";
menuBox.classList.add('hide');
menuBox.classList.add('custom-menu');
document.body.appendChild(menuBox);

// 工具栏
export let toolBox = document.createElement('div');
// toolBox.id = "toolBox";
// document.body.appendChild(toolBox);

// 侧边栏
export let sideBox = document.createElement('div');
// sideBox.id = "sideBox";
// document.body.appendChild(sideBox);

// 模式选择
export let modelSelect = document.createElement('select');
// modelSelect.id = 'model';
// document.body.appendChild(modelSelect);

// 底边栏
export let bottomBox = document.createElement('div');
// bottomBox.id = "bottomBox";
// document.body.appendChild(bottomBox);

// 信息栏
export let infoBox = document.createElement('div');
// infoBox.id = "infoBox";
// document.body.appendChild(infoBox);

// 拖动影子
export let ghostElement = document.createElement('div');
ghostElement.className = 'ghost';
ghostElement.style.display = 'none';
ghostElement.style.transformOrigin = '0 0';
baseBoard.appendChild(ghostElement);

import { shortcut } from "../index.js";
shortcut.addCSSToDoc('main/base/page/page.css')