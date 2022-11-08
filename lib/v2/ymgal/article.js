const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.ymgal.games';

const types = {
    news: '?type=NEWS&page=1',
    column: '?type=COLUMN&page=1',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'news';
    const link = `${host}/co/topic/list` + types[type];

    const response = await got(link);
    const data = response.data.data;

    const items = await Promise.all(
        data.map(async (item) => {
            const itemUrl = host + '/co/article/' + item.topicId;
            const description = await ctx.cache.tryGet(item.topicId, async () => {
                const result = await got.get(itemUrl);
                const $ = cheerio.load(result.data);
                return $('article').html().trim();
            });
            const single = {
                title: item.title,
                link: itemUrl,
                pubDate: new Date(item.publishTime).toUTCString(),
                description,
            };
            return Promise.resolve(single);
        })
    );

    let info = '资讯';
    if (type === 'column') {
        info = '专栏';
    }

    ctx.state.data = {
        title: `月幕 Galgame - ${info}`,
        link: 'https://www.ymgal.games/co/article',
        description: `月幕 Galgame - ${info}`,
        item: items,
    };
};
