const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://grist.org/articles';
    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const listItems = $('li.tease')
        .toArray()
        .map((item) => {
            item = $(item);
            const id = item.attr('class').split('-').slice(-1)[0];
            const a = item.find('div.tease__content a').first();
            const description = item.find('div.tease__content p').text();
            const author = item
                .find('div.tease__content span.contributor-info__name a.byline-link')
                .toArray()
                .map((item) => $(item).text())
                .join(', ');
            const category = item
                .find('div.tease__content .contributor-info__more a')
                .toArray()
                .map((item) => $(item).text())
                .join(', ');
            const image = item.find('div.tease__art-wrapper div.tease__art--mobile img').attr('data-src');
            return {
                id,
                title: a.text(),
                link: String(a.attr('href')),
                description,
                author,
                category,
                itunes_item_image: image,
            };
        });

    const items = await Promise.all(
        listItems.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                const time = $('dt.article-meta__item-label:contains("Published") + dd.article-meta__item-value').text();
                item.pubDate = timezone(parseDate(time, 'MMMDD,YYYY'), 0);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'Gist Latest Articles',
        link: baseUrl,
        item: items,
        description: 'Latest Articles on Grist.org',
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
};
