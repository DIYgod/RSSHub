const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseUrl = 'https://www.biostars.org';

module.exports = async (ctx) => {
    const currentUrl = baseUrl;

    const response = await got(currentUrl);

    const $ = cheerio.load(response.data);

    const list = $('div.items .content .title a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: $(item).text().trim(),
                link: baseUrl + $(item).attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('div.content div.wrap.magnify').first().html();
                item.pubDate = parseDate($('div.content time').attr('datetime'));
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Biostars posts',
        link: currentUrl,
        item: items,
    };
};
