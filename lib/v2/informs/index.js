const config = require('@/config').value;
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://pubsonline.informs.org';

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'orsc';
    const cateUrl = `${rootUrl}/toc/${category}/0/0`;

    const getCookie = () =>
        ctx.cache.tryGet(cateUrl, async () => {
            const setCookiesUrl = `${cateUrl}?cookieSet=1`;

            const response = await got.extend({ followRedirect: false }).get(setCookiesUrl, {
                headers: {
                    Referer: cateUrl,
                },
            });
            const cookie = response.headers['set-cookie']
                .slice(1)
                .map((item) => item.split(';')[0])
                .join('; ');

            return cookie;
        });

    const response = await got.get(cateUrl, {
        headers: {
            referer: cateUrl,
            'User-Agent': config.ua,
            cookie: await getCookie(),
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('div.issue-item')
        .slice(0, 10)
        .map((_, item) => ({
            title: $(item).find('h5.issue-item__title').text(),
            link: `${rootUrl}${$(item).find('h5.issue-item__title > a').attr('href')}`,
            pubDate: parseDate($(item).find('div.rlist--inline.separator.toc-item__detail > p').remove('span').text()),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link, {
                    headers: {
                        referer: cateUrl,
                        'User-Agent': config.ua,
                        cookie: await getCookie(),
                    },
                });
                const detail = cheerio.load(detailResponse.data);
                item.description = art(path.join(__dirname, 'templates/content.art'), {
                    author: detail('div.accordion-tabbed.loa-accordion').text(),
                    content: detail('div.hlFld-Abstract').find('h2').replaceWith($('<h2>Abstract </h2>')).end().html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `INFORMS - ${category}`,
        link: cateUrl,
        item: items,
    };
};
