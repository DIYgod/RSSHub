const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');
const { CookieJar } = require('tough-cookie');

const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const baseUrl = 'https://monitor.firefox.com';

    const response = await got({
        url: baseUrl + '/breaches',
        headers: {
            Referer: baseUrl,
        },
        cookieJar,
    });

    const $ = cheerio.load(response.body);

    const list = JSON.parse($('div#breach-array-json').attr('data-breach-array')).breaches.map((item) => ({
        title: item.Title,
        link: baseUrl + '/breach-details/' + item.Name,
        pubDate: timezone(parseDate(item.AddedDate), 0),
        category: item.DataClasses.split(', '),
    }));

    const items = await Promise.all(
        list &&
            list.map((item) =>
                ctx.cache.tryGet(
                    item.link,
                    async () => {
                        const article = await got({
                            url: item.link,
                            headers: {
                                Referer: baseUrl + '/breaches',
                            },
                            cookieJar,
                        });
                        const content = cheerio.load(article.body);

                        item.description = art(path.join(__dirname, 'templates/description.art'), {
                            headers: content('#breach-detail').html(),
                            overview: content('section.detail-section.jst-cntr.flx.flx-col').html(),
                            dataClasses: content('section.detail-section.bg-white.jst-cntr.flx.flx-col').html(),
                        });

                        return item;
                    },
                    31536000
                )
            )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: baseUrl,
        description: $('head meta[name=description]').attr('content').trim(),
        item: items,
        image: $('head meta[property=og:image]').attr('content'),
    };

    ctx.state.json = {
        title: $('title').text(),
        link: baseUrl,
        description: $('head meta[name=description]').attr('content').trim(),
        item: items,
        image: $('head meta[property=og:image]').attr('content'),
    };
};
