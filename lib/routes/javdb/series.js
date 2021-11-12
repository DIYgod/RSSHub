const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const filter = ctx.params.filter || '';

    const currentUrl = `/series/${id}?f=${filter}`;

    const filters = {
        '': '',
        playable: '可播放',
        single: '單體作品',
        download: '可下載',
        cnsub: '字幕',
        preview: '預覽圖',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filter[filter]}`} `;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
