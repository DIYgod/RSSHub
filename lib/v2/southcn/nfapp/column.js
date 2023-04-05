const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const columnId = ctx.params.column ?? 38;
    const currentUrl = `https://api.nfapp.southcn.com/nfplus-manuscript-web/article/list?columnId=${columnId}&nfhSubCount=1&pageNum=1&pageSize=20`; // this api only returns up to 10 articles

    const { data: response } = await got(currentUrl);

    const list = response.data.list
        .filter((i) => i.articleType === 0)
        .map((item) => ({
            title: '【' + item.columnName + '】' + item.title,
            description: art(path.join(__dirname, '../templates/description.art'), {
                thumb: item.picMiddle,
                description: item.summary === '详见内文' ? '' : item.summary,
            }),
            pubDate: timezone(parseDate(item.updateTime), +8),
            link: `http://pc.nfapp.southcn.com/${item.columnId}/${item.articleId}.html`,
            articleId: item.articleId,
            shareUrl: item.shareUrl,
        }));

    const items = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `南方+`,
        link: `https://m.nfapp.southcn.com/${columnId}`,
        item: items,
    };
};
