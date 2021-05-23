const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const link = 'https://www.huxiu.com/article';
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('.article-item--normal > a, .article-item--large > a')
        .slice(0, 10)
        .get()
        .map((e) => $(e).attr('href'));

    const items = await utils.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '虎嗅网 - 首页资讯',
        link,
        description: '聚合优质的创新信息与人群，捕获精选 | 深度 | 犀利的商业科技资讯。在虎嗅，不错过互联网的每个重要时刻。',
        item: items,
    };
};
