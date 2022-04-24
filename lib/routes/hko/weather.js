const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://rss.weather.gov.hk/rss/CurrentWeather.xml';
    const cache = await ctx.cache.get(url);
    if (cache) {
        return JSON.parse(cache);
    }

    const { data } = await got({ method: 'get', url });
    const $ = cheerio.load(data, {
        xmlMode: true,
    });
    const weather = $('description').slice(1, 2).text();

    const $$ = cheerio.load(weather);
    const items = [];
    $$('table')
        .find('td')
        .each((index, element) => {
            if (index % 2) {
                return;
            }
            const area = $$(element).text();
            const degree = $$(element).next().text().split(' ')[0];

            const item = {
                title: area,
                description: degree,
            };
            items.push(item);
        });
    const result = {
        title: 'Current Weather Report',
        description: ` provided by the Hong Kong Observatory: ${$('pubDate').text()}`,
        link: url,
        item: items,
    };
    // one hour cache
    ctx.cache.set(url, JSON.stringify(result));

    ctx.state.data = result;
};
