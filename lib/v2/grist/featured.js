const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://grist.org/';
    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const listItems = $('li.hp-featured__tease')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.small-tease__link');
            const author = item
                .find('span.contributor-info__name a.byline-link')
                .toArray()
                .map((item) => $(item).text())
                .join(', ');
            const image = item.find('img').attr('src');
            return {
                title: a.text(),
                link: a.attr('href'),
                author,
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
                item.description = $('.article__content .article-body')
                    .clone()
                    .children('div')
                    .remove()
                    .end()
                    .toArray()
                    .map((element) => $(element).html())
                    .join('');
                item.category = $('dt.article-meta__item-label:contains("Topic") + dd.article-meta__item-value a').attr('href').split('/')[1];

                return item;
            })
        )
    );
    ctx.state.data = {
        title: 'Gist Featured Articles',
        link: baseUrl,
        item: items,
        description: 'Featured Articles on Grist.org',
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
};
