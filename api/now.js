const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));
const logger = require('@/utils/logger');
const config = require('@/config').value;
logger.clear();
const s = require('@/app.js').callback();

module.exports = (req, res) => {
    s(req, res);
    // set cdn cache timeout of now
    res.setHeader('Cache-Control', `max-age=0, s-maxage=${config.cache.routeExpire}`);
};
