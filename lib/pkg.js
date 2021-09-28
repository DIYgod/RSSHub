import { set as setConfig } from '@/config/index.js';
let app;

export default {
    init: async (conf) => {
        setConfig(
            Object.assign(
                {
                    IS_PACKAGE: true,
                },
                conf
            )
        );
        app = await import('./app');
    },
    request: (path) =>
        new Promise((resolve, reject) => {
            app.callback()(
                {
                    url: path,
                    method: 'GET',
                    headers: {},
                    socket: {},
                },
                {
                    setHeader: () => {},
                    removeHeader: () => {},
                    end: (data) => {
                        data = JSON.parse(data);
                        if (data.error) {
                            reject(data.error.message);
                        } else {
                            resolve(data);
                        }
                    },
                }
            );
        }),
};
