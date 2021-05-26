const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.params.filter = ctx.params.filter || '';

    const currentUrl = `${utils.rootUrl}/actors/${ctx.params.id}?t=${ctx.params.filter}`;

    const filter = {
        '': '',
        p: '可播放',
        s: '單體作品',
        d: '可下載',
        c: '含字幕',
    };

    const title = `JavDB${filter[ctx.params.filter] === '' ? '' : ` - ${filter[ctx.params.filter]}`} `;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
