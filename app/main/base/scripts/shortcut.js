export let shortcut = {
    /**
    * 动态添加CSS文件到文档中。
    * @param {string} cssPath - CSS文件的相对路径，相对于app目录。
    */
    addCSSToDoc: (cssPath) => {
        let link = document.createElement('link');

        const currentUrl = new URL(window.location.href);

        const isInAppRoot = currentUrl.pathname.startsWith('/app/');

        let adjustedCssPath;
        if (isInAppRoot) {
            adjustedCssPath = '/app/' + cssPath;
        } else {
            adjustedCssPath = '/' + cssPath;
        }

        link.href = adjustedCssPath;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    },
    debounce: (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}