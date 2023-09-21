const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { getHeaders, randomString, decryptAES } = require('./utils');

module.exports = async (ctx) => {
    const key = randomString(16);

    const { data: response } = await got('https://api.ainvest.com/gw/news_f10/v1/newsFlash/getNewsData', {
        headers: getHeaders(key),
        searchParams: {
            terminal: 'web',
            tab: 'all',
            page: 1,
            size: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 50,
            lastId: '',
            timestamp: Date.now(),
        },
    });

    const { data } = JSON.parse(decryptAES(response, key));

    const items = data.content.map((item) => ({
        title: item.title,
        description: item.content,
        link: item.sourceUrl,
        pubDate: parseDate(item.publishTime, 'x'),
        category: item.tagList.map((tag) => tag.nameEn),
        author: item.userInfo.nickname,
        upvotes: item.likeCount,
        comments: item.commentCount,
    }));

    ctx.state.data = {
        title: 'AInvest - Latest News',
        link: 'https://www.ainvest.com/news',
        language: 'en',
        item: items,
    };
};
