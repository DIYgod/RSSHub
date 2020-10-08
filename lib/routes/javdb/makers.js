const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.params.filter = ctx.params.filter || '';

    const currentUrl = `${utils.rootUrl}/makers/${ctx.params.id}?f=${ctx.params.filter}`;

    const filter = {
        '': '',
        playable: '可播放',
        single: '單體作品',
        download: '可下載',
        cnsub: '字幕',
        preview: '預覽圖',
    };

    const title = `JavDB${filter[ctx.params.filter] === '' ? '' : ` - ${filter[ctx.params.filter]}`} `;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
