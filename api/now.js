const config = require('../lib/config');
const app = require('../lib/app');

config.set({
    noLogFiles: true,
});

module.exports = (req, res) => {
    app.callback()(req, res);
};
