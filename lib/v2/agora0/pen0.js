const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://agorahub.github.io';
    const response = await got(`${baseUrl}/pen0/`);
    const $ = cheerio.load(response.data);

    const list = $('div article')
        .toArray()
        .slice(0, -1) // last one is a dummy
        .map((item) => {
            item = $(item);
            const meta = item.find('h5').first().text();
            return {
                title: item.find('h3').text(),
                link: item.find('h3 a').attr('href'),
                author: meta.split('|')[0].trim(),
                pubDate: parseDate(meta.split('|')[1].trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                $('h1').remove();
                item.description = $('article').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: response.url,
        image: $('link[rel="apple-touch-icon"]').attr('href'),
        item: items,
    };
};
