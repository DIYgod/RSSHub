const config = require('./config');
let app;

module.exports = {
    init: (conf) => {
        config.set(
            Object.assign(
                {
                    IS_PACKAGE: true,
                },
                conf
            )
        );
        app = require('./app');
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
