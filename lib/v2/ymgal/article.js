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
    const type = ctx.params.type || 'all';

    const link = `${host}/co/topic/list` + types[type];
    let data = [];
    if (type === 'all') {
        await Promise.all(
            Object.values(types).map(async (type) => {
                const response = await got(`${host}/co/topic/list${type}`);
                data.push.apply(data, response.data.data);
            })
        );
        data = data.sort((a, b) => b.publishTime - a.publishTime).slice(0, 10);
    } else {
        const response = await got(link);
        data = response.data.data;
    }

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

    let info = '全部文章';
    if (type === 'news') {
        info = '资讯';
    } else if (type === 'column') {
        info = '专栏';
    }

    ctx.state.data = {
        title: `月幕 Galgame - ${info}`,
        link: `${host}/co/article`,
        description: `月幕 Galgame - ${info}`,
        item: items,
    };
};
