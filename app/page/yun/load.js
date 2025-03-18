let isOnline = true;
if (!navigator.onLine) {
    isOnline = false;
}

window.addEventListener('online', function () {
    isOnline = true;
});

window.addEventListener('offline', function () {
    isOnline = false;
});

function addJSToDoc(url) {
    let script = document.createElement('script');
    script.src = url;
    script.type = "module";
    document.body.appendChild(script);
}

function addCSSToDoc(url) {
    let link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

addJSToDoc('/app/path/yuns/dataType/dataType.js');

