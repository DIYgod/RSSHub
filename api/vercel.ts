const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));

const { setConfig } = require('../lib/config');
setConfig({
    NO_LOGFILES: true,
});

const { handle } = require('hono/vercel');
const app = require('../lib/app');
const logger = require('../lib/utils/logger');

logger.info(`🎉 RSSHub is running! Cheers!`);
logger.info('💖 Can you help keep this open source project alive? Please sponsor 👉 https://docs.rsshub.app/support');

module.exports = handle(app);
