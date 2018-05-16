const cluster = require('cluster');

const cmd = {
    GET: 'rsshub/cache/memory/GET',
    SET: 'rsshub/cache/memory/SET'
};

if (cluster.isMaster) {
    const lru = require('lru-cache');

    // 内存缓存服务端
    class memoryCacheMaster {

        /**
         * @param {lru.Options<any, any>} option 
         */
        constructor(option) {
            this.memoryCache = lru({
                maxAge: 30 * 60 * 1000, // 30 min
                max: Infinity,
                ...option
            });

            cluster.on('message', this.handleMessage.bind(this));
        }

        handleMessage(worker, message = {}, handle) {
            try {
                switch (message.method) {
                    case cmd.GET:
                        const date = this.memoryCache.get(message.key);
                        worker.send({
                            method: cmd.GET,
                            key: message.key,
                            payload: date,
                            success: true,
                            identifier: message.identifier
                        });
                        break;
                    case cmd.SET:
                        const res = this.memoryCache.set(message.key, message.payload);
                        worker.send({
                            method: cmd.SET,
                            key: message.key,
                            success: res,
                            identifier: message.identifier
                        });
                        break;
                    default:
                        worker.send({
                            method: message.method,
                            key: message.key,
                            success: false,
                            identifier: message.identifier
                        });
                        break;
                }
            } catch (err) {
                worker.send({
                    method: message.method,
                    key: message.key,
                    success: false,
                    identifier: message.identifier
                });
            }
        }
    }

    memoryCacheMaster.prototype.cmd = cmd;

    module.exports = memoryCacheMaster;
} else {
    const TIMEOUT = 500;
    const randomString = require('./randomString');
    // 内存缓存客户端
    module.exports = {
        get: (key) => (new Promise((resolve, reject) => {

            // 生成请求标识符
            const identifier = randomString(10);

            // 超时
            const timeout = setTimeout(() => {
                reject(new Error('Fetch cache timeout.'));
                process.removeListener(handleMessage);
            }, 500);

            const handleMessage = (message) => {
                if (message.identifier === identifier) {
                    // 命中
                    if (message.success !== false) {
                        resolve(message.payload);
                    } else {
                        reject(new Error('Fetch cache failed.'));
                    }
                    process.removeListener('message', handleMessage);
                    clearTimeout(timeout);
                }
            }
            process.addListener('message', handleMessage);

            process.send({
                method: cmd.GET,
                key,
                identifier
            });
        })),
        set: (key, value) => (new Promise((resolve, reject) => {

            // 生成请求标识符
            const identifier = randomString(10);
            process.send({
                method: cmd.SET,
                key,
                payload: value,
                identifier
            });

            // 超时
            const timeout = setTimeout(() => {
                reject(new Error('Set cache timeout.'));
                process.removeListener('message', handleMessage);
            }, 500);

            const handleMessage = (message = {}) => {
                if (message.identifier === identifier) {
                    // 命中
                    if (message.success !== false) {
                        resolve(true);
                    } else {
                        reject(new Error('Set cache failed.'));
                    }
                    process.removeListener('message', handleMessage);
                    clearTimeout(timeout);
                }
            }

            process.addListener('message', handleMessage);
        })),
        cmd
    }
}