const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));
const logger = require('@/utils/logger');
logger.clear();
const s = require('@/app.js').callback();

module.exports = (req, res) => {
    s(req, res);
};
