const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const filter = ctx.params.filter ?? '';
    const sort = ctx.params.sort ?? '0';

    const currentUrl = `/lists/${id}?lst=${sort}${filter && filter !== 'none' ? `&f=${filter}` : ''}`;

    const filters = {
        '': '',
        none: '',
        playable: '可播放',
        single: '單體作品',
        download: '含磁链',
        cnsub: '含字幕',
        preview: '預覽圖',
    };

    const sortOptions = {
        0: '加入时间排序',
        1: '发布时间排序',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} ${sortOptions[sort]}`;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
