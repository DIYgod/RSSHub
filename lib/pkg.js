const app = require('./app');
const config = require('./config');

module.exports = {
    setConfig: (conf) => {
        config.set(conf);
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
