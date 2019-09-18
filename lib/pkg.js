let app;
const config = require('./config');

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
                    end: (data) => {
                        resolve(data);
                    },
                }
            );
        }),
};
