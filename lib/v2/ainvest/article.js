const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { getHeaders, randomString, encryptAES, decryptAES } = require('./utils');

module.exports = async (ctx) => {
    const key = randomString(16);

    const { data: response } = await got.post('https://api.ainvest.com/gw/socialcenter/v1/edu/article/listArticle', {
        headers: getHeaders(key),
        searchParams: {
            timestamp: Date.now(),
        },
        data: encryptAES(
            JSON.stringify({
                batch: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
                startId: null,
                tags: {
                    in: ['markettrends', 'premarket', 'companyinsights', 'macro'],
                    and: ['web', 'creationplatform'],
                },
            }),
            key
        ),
    });

    const { data } = JSON.parse(decryptAES(response, key));

    const items = data.map((item) => ({
        title: item.title,
        description: item.content,
        link: item.sourceUrl,
        pubDate: parseDate(item.postDate, 'x'),
        category: [item.nickName, ...item.tags.map((tag) => tag.code)],
    }));

    ctx.state.data = {
        title: 'AInvest - Latest Articles',
        link: 'https://www.ainvest.com/news',
        language: 'en',
        item: items,
    };
};
