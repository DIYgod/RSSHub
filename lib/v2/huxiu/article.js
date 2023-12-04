const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const utils = require('./utils');

module.exports = async (ctx) => {
    const link = `${utils.baseUrl}/article/`;
    const { data } = await got.post(`${utils.articleApi}/web/article/articleList`, {
        headers: {
            Referer: link,
        },
        form: {
            platform: 'www',
            pagesize: ctx.query.limit ? parseInt(ctx.query.limit) : 22,
        },
    });

    const list = data.data.dataList.map((item) => ({
        title: item.title,
        link: `${utils.baseUrl}/article/${item.aid}.html`,
        description: item.summary,
        pubDate: parseDate(item.dateline, 'X'),
        author: item.user_info.username,
    }));

    const items = await utils.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: '虎嗅网 - 首页资讯',
        link,
        description: '聚合优质的创新信息与人群，捕获精选 | 深度 | 犀利的商业科技资讯。在虎嗅，不错过互联网的每个重要时刻。',
        item: items,
    };
};
