const app = require('./app');

const pkg = (path) =>
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
    });

module.exports = pkg;
