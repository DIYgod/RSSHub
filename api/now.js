import { setConfig } from '../lib/config.js';
import app from './lib/app.js'

setConfig({
    NO_LOGFILES: true,
});

module.exports = (req, res) => {
    app.callback()(req, res);
};
