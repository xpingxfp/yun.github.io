export let edit = {
    dblclickEdit
}

/**
 * @param {Element} element - 
 * @param {function} callback - 
 */
function dblclickEdit(element, callback) {
    element.addEventListener('dblclick', () => {
        let content = element.textContent;
        let event = { state: null, content: content };
        event.state = "editing";
        callback(event);

        let editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = content;
        editInput.classList.add('edit-title-input');

        element.textContent = '';
        element.appendChild(editInput);

        editInput.focus();

        const update = (newContent) => {
            event.state = "edited";
            event.content = newContent;
            if (newContent.trim() !== "") {
                element.textContent = newContent;
            } else {
                element.textContent = content;
            }

            if (typeof callback === 'function') {
                callback(event);
            }
        };

        editInput.addEventListener('blur', () => {
            update(editInput.value);
        });

        editInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                update(editInput.value);
            }
        });
    });
}
