const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.params.filter = ctx.params.filter || '';
    ctx.params.keyword = ctx.params.keyword || '';

    const currentUrl = `${utils.rootUrl}/search?q=${ctx.params.keyword}&f=${ctx.params.filter}`;

    const filter = {
        '': '',
        playable: '可播放',
        single: '單體作品',
        actor: '演員',
        maker: '片商',
        director: '導演',
        series: '系列',
        code: '番號',
        download: '可下載',
        cnsub: '字幕',
        preview: '預覽圖',
    };

    const title = `關鍵字 ${ctx.params.keyword} ${filter[ctx.params.filter] === '' ? '' : `+ ${filter[ctx.params.filter]}`} 搜索結果 - JavDB `;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
