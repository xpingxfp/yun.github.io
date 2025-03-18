export function header() {
    let header = document.createElement('div');
    header.classList.add('header');

    let titleSpan = document.createElement('span');
    titleSpan.classList.add("title");
    titleSpan.innerHTML = "标题";
    header.appendChild(titleSpan);

    header.data = {
        title: titleSpan,
    }

    return header;
}

