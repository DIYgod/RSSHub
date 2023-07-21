const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const columnId = ctx.params.column ?? 38;

    const getColumnDetail = `https://api.nfapp.southcn.com/nanfang_if/getColumn?columnId=${columnId}`;
    const { data: responseColumn } = await got(getColumnDetail);
    const columnName = responseColumn.columnName === '' ? `南方+` : `南方+ - ${responseColumn.columnName}`;
    const columnLink = responseColumn.linkUrl === '' ? `https://m.nfapp.southcn.com/${columnId}` : responseColumn.linkUrl;

    /* Notes of columnLink:
    1) 南方号 uses responseColumn.linkUrl, e.g. https://static.nfapp.southcn.com/nfh/shareNFNum/index.html?nfhId=3392;
    2) 栏目/频道's responseColumn.linkUrl is empty, we use its subpage on 南方+ mobile site, e.g. https://m.nfapp.southcn.com/38;
    3) But https://m.nfapp.southcn.com/${columnId} may still be invalid for some higher-level columns, e.g. 20.
    */

    const getArticleList = `https://api.nfapp.southcn.com/nfplus-manuscript-web/article/list?columnId=${columnId}&nfhSubCount=1&pageNum=1&pageSize=20`; // this api only returns up to 20 articles
    const { data: responseArticle } = await got(getArticleList);
    const list = responseArticle.data.list
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
        title: columnName,
        link: columnLink,
        item: items,
    };
};
