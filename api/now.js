const app = require('../lib/app');

module.exports = (req, res) => {
    app.callback()(req, res);
};
