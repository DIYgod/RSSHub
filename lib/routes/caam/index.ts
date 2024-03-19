import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const { category = '1' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'http://www.caam.org.cn';
    const currentUrl = new URL(`chn/1/cate_${category}/list_1.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('span.cont')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.parent();

            return {
                title: item.text(),
                link: new URL(a.prop('href'), currentUrl).href,
                pubDate: parseDate(a.find('span.time').text(), '[YYYY.MM.DD]'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const infoEls = content('div.fourTop em');

                item.title = content('div.fourTop h2').text();
                item.description = content('div.fourBox').html();
                item.author = infoEls.length <= 1 ? undefined : content('div.fourTop em').last().text();
                item.pubDate = parseDate(infoEls.first().text());

                return item;
            })
        )
    );

    const author = $('div.footer a').first().text();
    const subtitle = $('div.topMeuns ul li a').last().text();
    const image = new URL('images/header-back-7.png', rootUrl).href;

    return {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        subtitle,
        author,
    };
}
