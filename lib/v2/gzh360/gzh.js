const { mpIdEncode, mpIdDecode } = require('./utils');
const universal = require('./universal');

module.exports = async (ctx) => {
    const path = 'gzh_articles';

    let name = ctx.params.name;
    let id = name;

    // in order to support RSSHub Radar, we need to accept both name and id
    try {
        name = mpIdDecode(name);
    } catch {
        id = mpIdEncode(name);
    }

    await universal(ctx, path, id, '', name, true, true);
};
