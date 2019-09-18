const config = require('./config');
let app;

module.exports = {
    init: (conf) => {
        config.set(
            Object.assign(
                {
                    isPackage: true,
                },
                conf
            )
        );
        app = require('./app');
    },
    request: (path) =>
        new Promise((resolve) => {
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
                        resolve(JSON.parse(data));
                    },
                }
            );
        }),
};
