const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://news.ifeng.com';
    const currentUrl = `${rootUrl}${ctx.path.replace(/^\/news/, '')}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const newsStream = JSON.parse(response.data.match(/"newsstream":(\[.*?\]),"cooperation"/)[1]);

    let items = newsStream.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: timezone(parseDate(item.newsTime), +8),
        description: item.thumbnails.image.pop(),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                item.author = detailResponse.data.match(/"editorName":"(.*?)",/)[1];
                item.category = detailResponse.data.match(/},"keywords":"(.*?)",/)[1].split(',');
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: item.description,
                    description: JSON.parse(detailResponse.data.match(/"contentList":(\[.*?\]),/)[1]).map((content) => content.data),
                });
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
