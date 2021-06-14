const got = require('@/utils/got');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.iyingdi.com';
    const url = `${rootUrl}/feed/list/user/v3?feedIdUp=0&feedIdDown=0&hotfeed=1&system=web`;
    const response = await got.get(url);
    const feeds = response.data.feeds;

    const articleList = feeds
        .slice(0, 15)
        .map((element) => {
            const single = {
                title: element.feed.title,
                pubDate: parseDate(element.feed.created * 1000),
                link: `${rootUrl}/tz/post/${element.feed.sourceID}`,
                guid: element.feed.title,
                postId: element.feed.sourceID,
            };
            return single;
        })
        .filter((item) => item.title !== undefined);

    const items = await utils.ProcessFeed(ctx, articleList);

    ctx.state.data = {
        title: '旅法师营地 - 首页资讯（旧版）',
        link: rootUrl,
        item: items,
    };
};
