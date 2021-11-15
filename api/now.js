import config from '../lib/config';
config.set({
    NO_LOGFILES: true,
});

import app from '../lib/app.js';

export default (req, res) => {
    app.callback()(req, res);
};
