// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { id = 'sytzgg' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'http://www.jgjcndrc.org.cn';
    const currentUrl = new URL(`list.aspx?clmId=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.list_02 li.li a[title]')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
                pubDate: parseDate(item.prev().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('div.txt_title1').text();
                item.description = content('div#zoom').html();
                item.pubDate = parseDate(content('div.txt_subtitle1').text().trim());

                return item;
            })
        )
    );

    const author = $('title').text();
    const subtitle = $('li.L').first().text();
    const image = new URL($('img.logo2').prop('src'), rootUrl).href;

    ctx.set('data', {
        item: items,
        title: `${author} - ${subtitle}`,
        link: currentUrl,
        description: author,
        language: $('html').prop('lang'),
        image,
        subtitle,
        author,
    });
};
