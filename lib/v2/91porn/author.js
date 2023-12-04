const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { domainValidation } = require('./utils');

module.exports = async (ctx) => {
    const { domain = '91porn.com' } = ctx.query;
    const { uid, lang = 'en_US' } = ctx.params;
    const siteUrl = `https://${domain}/uvideos.php?UID=${uid}&type=public`;
    domainValidation(domain, ctx);

    const response = await got.post(siteUrl, {
        form: {
            session_language: lang,
        },
        headers: {
            referer: siteUrl,
        },
    });

    const $ = cheerio.load(response.data);

    let items = $('.row .well')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.video-title').text(),
                link: item.find('a').attr('href'),
                poster: item.find('.img-responsive').attr('src'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(`91porn:${lang}:${new URL(item.link).searchParams.get('viewkey')}`, async () => {
                const { data } = await got(item.link);
                const $ = cheerio.load(data);

                item.pubDate = parseDate($('.title-yakov').eq(0).text(), 'YYYY-MM-DD');
                item.description = art(path.join(__dirname, 'templates/index.art'), {
                    link: item.link,
                    poster: item.poster,
                });
                item.author = $('.title-yakov a span').text();
                delete item.poster;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.login_register_header').text()} - 91porn`,
        link: siteUrl,
        item: items,
    };
};
