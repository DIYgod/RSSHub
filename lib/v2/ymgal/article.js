const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

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
        data.map((item) => {
            const itemUrl = host + '/co/article/' + item.topicId;
            return ctx.cache.tryGet(itemUrl, async () => {
                const result = await got(itemUrl);
                const $ = cheerio.load(result.data);
                const description = $('article').html().trim();
                return {
                    title: item.title,
                    link: itemUrl,
                    pubDate: timezone(parseDate(item.publishTime), 8),
                    description,
                };
            });
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
