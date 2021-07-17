const utils = require('./utils');

module.exports = async (ctx) => {
    const filter = ctx.params.filter || '';
    const keyword = ctx.params.keyword || '';

    const currentUrl = `/search?q=${keyword}&f=${filter}`;

    const filters = {
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

    const title = `關鍵字 ${keyword} ${filters[filter] === '' ? '' : `+ ${filters[filter]}`} 搜索結果 - JavDB`;

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
