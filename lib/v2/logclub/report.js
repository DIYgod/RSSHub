const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id = 'Report' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 11;

    const rootUrl = 'https://www.logclub.com';
    const currentUrl = new URL('lc_report', rootUrl).href;
    const apiUrl = new URL(`front/lc_report/load${id}List`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        json: {
            page: 1,
        },
    });

    let items = response.list.slice(0, limit).map((item) => ({
        title: item.title,
        link: new URL(`front/lc_report/get_report_info/${item.id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: {
                src: item.img_url?.split(/\?/)[0] ?? undefined,
                alt: item.title,
            },
        }),
        author: item.author,
        category: [item.channel_name],
        guid: `logclub-report-${item.id}`,
        pubDate: timezone(parseDate(item.release_time), +8),
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('img').each((_, el) => {
                    el = content(el);
                    el.replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: el.prop('src')?.split(/\?/)[0] ?? undefined,
                                alt: el.prop('title'),
                            },
                        })
                    );
                });

                item.title = content('h1').first().text();
                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('div.article-cont').html(),
                });
                item.author = content('div.lc-infos a')
                    .toArray()
                    .map((a) => content(a).text())
                    .join('/');
                item.category = [
                    ...new Set([
                        ...(item.category ?? []),
                        ...content('div.article-label-r a.label')
                            .toArray()
                            .map((c) => content(c).text()),
                    ]),
                ].filter((c) => c);

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const title = $('div.this_nav').text().trim();
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;
    const subtitle = $('meta[name="keywords"]').prop('content');

    ctx.state.data = {
        item: items,
        title: `${$('title').text()}${title}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image: new URL($('div.logo_img img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: subtitle.replace(/,/g, ''),
        author: subtitle.split(/,/)[0],
    };
};
