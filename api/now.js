import path from 'path';
import moduleAlias from 'module-alias';
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));

import config from '../lib/config';
config.set({
    NO_LOGFILES: true,
});

import app from '../lib/app';

export default (req, res) => {
    app.callback()(req, res);
};
