// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const baseUrl = 'https://gh.bjedu.cn';
    const { urlPath = 'zxtzgg' } = ctx.req.param();

    const { data: response, url: link } = await got(`${baseUrl}/ghsite/${urlPath}/index.html`);
    const $ = load(response);

    const list = $('.content li a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: item.attr('href').startsWith('http') ? item.attr('href').replace(/^http:/, 'https:') : new URL(item.attr('href'), link).href,
                pubDate: item.prev().length ? timezone(parseDate(item.prev().text().trim(), 'YYYY-MM-DD'), +8) : null,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.endsWith('.html')) {
                    return item;
                }
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.title = item.title.endsWith('...') ? $('.con-h h1').text().trim() : item.title;
                item.pubDate = timezone(parseDate($('.con-h span').eq(0).text().trim(), 'YYYY-MM-DD HH:mm:ss'), +8);
                item.author = $('.con-h span').eq(1).text().trim();
                item.description = $('.content_font').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        link,
        item: items,
    });
};
