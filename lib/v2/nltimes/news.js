const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const map = new Map([
    ['top-stories', { title: 'NL Times -- Top Stories', suffix: '/top-stories' }],
    ['health', { title: 'NL Times -- Health', suffix: '/categories/health' }],
    ['crime', { title: 'NL Times -- Crime', suffix: '/categories/crime' }],
    ['politics', { title: 'NL Times -- Politics', suffix: '/categories/politics' }],
    ['business', { title: 'NL Times -- Business', suffix: '/categories/business' }],
    ['tech', { title: 'NL Times -- Tech', suffix: '/categories/tech' }],
    ['culture', { title: 'NL Times -- Culture', suffix: '/categories/culture' }],
    ['sports', { title: 'NL Times -- Sports', suffix: '/categories/sports' }],
    ['weird', { title: 'NL Times -- Weird', suffix: '/categories/weird' }],
    ['1-1-2', { title: 'NL Times -- 1-1-2', suffix: '/categories/1-1-2' }],
]);

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'top-stories';
    const suffix = map.get(category).suffix;

    const rootUrl = 'https://www.nltimes.nl';
    const apiUrl = rootUrl + suffix;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.news-card')
        .slice(0, 10)
        .map((_, elem) => {
            const item = {
                link: $(elem).children('.news-card__title').first().children('a').first().attr('href'),
                title: $(elem).children('.news-card__title').first().children('a').first().text(),
                date: $(elem).children('.news-card__date').first().text(),
                category: $(elem)
                    .children('.news-card__categories')
                    .first()
                    .children('a')
                    .map((_, elem) => $(elem).text())
                    .get(),
            };
            return item;
        })
        .get();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        return $('.news-article--body').html();
    };

    const items = await Promise.all(
        list.map((item) => {
            const title = item.title;
            const date = timezone(parseDate(item.date, 'DD MMMM YYYY - HH:mm'), +1); // Central European Time
            const link = rootUrl + item.link;
            const category = item.category;

            return ctx.cache.tryGet(link, async () => {
                const response = await got({
                    method: 'get',
                    url: link,
                });

                const description = ProcessFeed(response.data);
                return {
                    title,
                    category,
                    description,
                    pubDate: date,
                    link,
                };
            });
        })
    );

    ctx.state.data = {
        title: map.get(category).title,
        language: 'en',
        link: apiUrl,
        description: map.get(category).title,
        item: items,
    };
};
