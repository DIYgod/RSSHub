const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const path = require('path');
const { art } = require('@/utils/render');
const { CookieJar } = require('tough-cookie');

const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const baseUrl = 'https://agirls.aotter.net';
    const category = ctx.params.category ?? '';

    const response = await got({
        url: baseUrl + '/posts' + (category ? `/${category}` : ''),
        headers: {
            Referer: baseUrl,
        },
        cookieJar,
    });

    const $ = cheerio.load(response.data);

    let items = $('div a.flex.flex-col')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('h2').text().trim(),
                link: baseUrl + item.attr('href'),
            };
        })
        .get();

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    url: item.link,
                    headers: {
                        Referer: baseUrl + '/posts/' + (category ? `/${category}` : ''),
                    },
                    cookieJar,
                });
                const content = cheerio.load(detailResponse.data);

                item.category = content('a.mr-2.bg-neutral-lightest.px-2.py-1.text-sm.text-neutral-light')
                    .toArray()
                    .map((e) => content(e).text().trim().replace('#', ''));
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    desc: content('div.post-content').html(),
                });
                item.pubDate = timezone(parseDate(content('time').text().trim()), +8);
                item.author = content('a.mr-1.text-primary').text().trim();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text().trim(),
        link: baseUrl + '/' + category,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
    };

    ctx.state.json = {
        title: $('head title').text().trim(),
        link: baseUrl + '/' + category,
        description: $('head meta[name=description]').attr('content'),
        item: items,
        language: $('html').attr('lang'),
        cookieJar,
    };
};
