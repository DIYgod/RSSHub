const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { parseItem } = require('./utils');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const currentUrl = `https://www.gelonghui.com/api/post/search/v4`;
    const { data } = await got(currentUrl, {
        searchParams: {
            keyword,
            isVipArticle: false,
            count: ctx.query.limit ? Number(ctx.query.limit) : 20,
            page: 1,
            searchArea: 'all',
        },
    });

    const list = data.result.map((item) => ({
        title: item.title,
        description: item.summary,
        link: item.link,
        author: item.source,
        pubDate: parseDate(item.timestamp, 'X'),
    }));

    const items = await Promise.all(list.map((item) => parseItem(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `格隆汇 - 关键词 “${keyword}” 的文章`,
        link: currentUrl,
        item: items,
        description: `找到关于 “ ${keyword} ”的文章，共${data.totalCount}个结果`,
    };
};
