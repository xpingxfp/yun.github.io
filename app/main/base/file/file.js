function getDBInstance(dbName, version = 1) {
    return new Promise((resolve, reject) => {
        let request = window.indexedDB.open(dbName, version);

        request.onerror = (event) => {
            console.error("数据库打开失败", event);
            reject(new Error("数据库打开失败"));
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };
    });
}

async function getDirHandle() {
    try {
        let yunDB = await getDBInstance("yunDB");

        let transaction = yunDB.transaction(["app"], "readonly");
        let app_store = transaction.objectStore("app");

        let dirHandleRequest = app_store.get("dirHandle");

        return new Promise((resolve, reject) => {
            dirHandleRequest.onsuccess = () => resolve(dirHandleRequest.result);
            dirHandleRequest.onerror = () => reject(dirHandleRequest.error);
            transaction.oncomplete = () => yunDB.close();
        });
    } catch (error) {
        console.error("从IndexedDB获取目录句柄失败：", error);
        throw error;
    }
}

async function getCurrent() {
    try {
        let yunDB = await getDBInstance("yunDB");

        let transaction = yunDB.transaction(["save"], "readonly");
        let app_store = transaction.objectStore("save");

        let dirHandleRequest = app_store.get("current");

        return new Promise((resolve, reject) => {
            dirHandleRequest.onsuccess = () => resolve(dirHandleRequest.result);
            dirHandleRequest.onerror = () => reject(dirHandleRequest.error);
            transaction.oncomplete = () => yunDB.close();
        });
    } catch (error) {
        console.error("从IndexedDB获取目录句柄失败：", error);
        throw error;
    }
}

export async function getCurrentFile(name) {
    let current = await getCurrent();
    let file = await current.getFileHandle(name, { create: false });
    return file;
}

async function createLogFile() {
    try {
        let current = await getCurrent();
        let logDir = await current.getDirectoryHandle("logs", { create: false });
        let now = new Date();
        let timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        let logFileName = timeString + ".log";
        let file = await logDir.getFileHandle(logFileName, { create: true });
        return file;
    } catch (error) {
        console.error("创建日志文件时发生错误:", error);
    }
}

/**
 * 文件流队列管理器，按顺序执行文件读写操作，避免并发冲突。
 * @class
 * @param {FileSystemFileHandle} fileHandle - 文件句柄，用于操作文件。
 */
export class FileStreamQueue {
    constructor(fileHandle) {
        this.queue = [];
        this.isProcessing = false;
        this.fileHandle = fileHandle;
    }

    /**
     * 处理队列中的操作，按顺序执行。
     * @private
     * @async
     */
    async processQueue() {
        this.isProcessing = true;
        while (this.queue.length > 0) {
            const { func } = this.queue.shift();
            try {
                await func();
            } catch (error) {
                console.error('操作执行失败:', error);
            }
        }
        this.isProcessing = false;
    }

    /**
     * 执行写入操作的底层方法。
     * @private
     * @async
     * @param {string|ArrayBuffer} content - 要写入的内容（字符串或二进制数据）。
     * @param {boolean} [keepExistingData=false] - 是否保留原有文件内容（追加模式需设为 `true`）。
     * @param {number} [position] - 写入的起始位置（默认：覆盖模式从 `0` 开始，追加模式从文件末尾开始）。
     */
    async _writeOperation(content, keepExistingData = false, position) {
        const file = await this.fileHandle.getFile();
        let seekPosition = position;
        if (seekPosition === undefined) {
            seekPosition = keepExistingData ? file.size : 0; // 自动计算位置
        }
        const writableStream = await this.fileHandle.createWritable({ keepExistingData });
        try {
            if (seekPosition !== 0) await writableStream.seek(seekPosition);
            await writableStream.write(content);
        } finally {
            await writableStream.close();
        }
    }

    /**
     * 覆盖写入文件内容。
     * @async
     * @param {string|ArrayBuffer} content - 覆盖写入的内容。
     * @returns {Promise<void>} - 写入成功时返回 `undefined`，失败时抛出错误。
     * @throws {Error} 写入操作失败时抛出异常。
     */
    async write(content) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                func: async () => {
                    try {
                        await this._writeOperation(content);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            });
            if (!this.isProcessing) this.processQueue();
        });
    }

    /**
     * 追加写入内容到文件末尾。
     * @async
     * @param {string|ArrayBuffer} content - 要追加的内容。
     * @returns {Promise<void>} - 写入成功时返回 `undefined`，失败时抛出错误。
     * @throws {Error} 写入操作失败时抛出异常。
     */
    async addWrite(content) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                func: async () => {
                    try {
                        await this._writeOperation(content, true); // 自动追加到末尾
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            });
            if (!this.isProcessing) this.processQueue();
        });
    }

    /**
     * 删除文件的最后一行。
     * @private
     * @async
     */
    async _deleteLastLineOperation() {
        const file = await this.fileHandle.getFile();
        let content = await file.text();
        const lines = content.split('\n');
        if (lines.length > 0) {
            lines.pop();
            content = lines.join('\n');
        }
        const writableStream = await this.fileHandle.createWritable({ keepExistingData: false });
        try {
            await writableStream.write(content);
        } finally {
            await writableStream.close();
        }
    }

    /**
     * 删除文件内容的最后一行。
     * @async
     * @returns {Promise<void>} - 操作成功时返回 `undefined`，失败时抛出错误。
     * @throws {Error} 删除操作失败时抛出异常。
     */
    async deleteLastLine() {
        return new Promise((resolve, reject) => {
            this.queue.push({
                func: async () => {
                    try {
                        await this._deleteLastLineOperation(); // 删除最后一行
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }
            });
            if (!this.isProcessing) this.processQueue();
        });
    }

    /**
     * 读取文件内容。
     * @async
     * @returns {Promise<string|ArrayBuffer>} - 文件内容（文本或二进制数据）。
     * @throws {Error} 读取操作失败时抛出异常。
     */
    async readFile() {
        return new Promise(async (resolve, reject) => {
            this.queue.push({
                func: async () => {
                    try {
                        const file = await this.fileHandle.getFile();
                        const content = await file.text();
                        resolve(content);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
            if (!this.isProcessing) this.processQueue();
        });
    }
}

let logFileHandle = await createLogFile();
let logQueue = new FileStreamQueue(logFileHandle);
export function writeToLog(type, text) {
    let now = new Date();
    let timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    let logEntry = `[${timeString}] [${type}]: ${text}\n`;
    logQueue.addWrite(logEntry);
}
