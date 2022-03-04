const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const filter = ctx.params.filter ?? '';

    const currentUrl = `/actors/${id}${filter ? `?t=${filter}` : ''}`;

    const filters = {
        '': '',
        p: '可播放',
        s: '單體作品',
        d: '可下載',
        c: '含字幕',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} `;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
