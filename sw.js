const CACHE_NAME = `yun-v1`;

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll([
            '/',
            'index.html',
            'manifest.json',
            'icon.png'
        ]);
        self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.filter(name => name !== CACHE_NAME)
                .map(name => caches.delete(name))
        );
        clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    let url = new URL(event.request.url);
    let path = url.pathname;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        } else {
            try {
                const dirHandleOrRedirect = await getDirHandle();

                if (dirHandleOrRedirect.type === 'redirect') {
                    const response = await fetch(dirHandleOrRedirect.url);
                    return response;
                } else {
                    const fileHandle = await getFileFromDirHandle(path, dirHandleOrRedirect);

                    if (fileHandle) {
                        const file = await fileHandle.getFile();
                        const blob = await file.arrayBuffer();
                        return new Response(blob, {
                            headers: {
                                'Content-Type': file.type
                            }
                        });
                    }
                }
            } catch (error) { }
            return fetch(event.request);
        }
    })());
});

async function getDirHandle() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open('yunDB', 1);

        request.onerror = () => {
            resolve({ type: 'redirect', url: '/index.html' });
        };

        request.onupgradeneeded = () => {
            resolve({ type: 'redirect', url: '/index.html' });
        }

        request.onsuccess = async (event) => {
            let db = event.target.result;
            let transaction = db.transaction(['app'], 'readonly');
            let objectStore = transaction.objectStore('app');

            let getDirHandleRequest = objectStore.get('dirHandle');

            getDirHandleRequest.onerror = (event) => {
                reject(new Error(`Error fetching directory handle from DB: ${event.target.error}`));
            };

            getDirHandleRequest.onsuccess = async (event) => {
                let dirHandle = getDirHandleRequest.result;

                if (!dirHandle) {
                    resolve({ type: 'redirect', url: '/index.html' });
                    return;
                }

                const permissionStatus = await dirHandle.queryPermission();
                if (permissionStatus !== 'granted') {
                    resolve({ type: 'redirect', url: '/index.html' });
                    return;
                }
                resolve(dirHandle);
            };
        };
    });
}

async function getFileFromDirHandle(path, dirHandle) {
    let segments = path.split('/').filter(segment => segment !== '');

    let currentHandle = dirHandle;

    try {
        let lastSegment = segments[segments.length - 1];
        let fileNameParts = lastSegment.split('.');
        let isFile = fileNameParts.length > 1;

        let length = isFile ? segments.length - 1 : segments.length;

        for (let i = 0; i < length; i++) {
            let segment = segments[i];
            currentHandle = await currentHandle.getDirectoryHandle(segment);
        }

        let targetHandle;
        if (isFile) {
            let fileName = segments[segments.length - 1];
            targetHandle = await currentHandle.getFileHandle(fileName);
        } else {
            targetHandle = await currentHandle.getFileHandle('index.html');
        }

        return targetHandle;
    } catch (error) {
        return null;
    }
}