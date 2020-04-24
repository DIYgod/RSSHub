const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));
const RSSHub = require('@/pkg');
const logger = require('@/utils/logger');
const config = require('@/config').value;

logger.clear();
const art = require('art-template');
const template = path.resolve(__dirname, '../lib/views/rss.art');
const s = async (req, res) => {
    RSSHub.init();
    let path = req.url;
    if (path.startsWith('/api')) {
        path = path.substring(4);
    }
    const data = await RSSHub.request(path);
    const rss = art(template, data);
    res.setHeader('Cache-Control', `max-age=0, s-maxage=${config.cache.routeExpire}`);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(rss);
};
module.exports = s;
