import { setConfig } from '../lib/config.js';
import app from './lib/app.js';

setConfig({
    NO_LOGFILES: true,
});

export default (req, res) => {
    app.callback()(req, res);
};
