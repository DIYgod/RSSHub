// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const baseUrl = 'https://www.ithome.com.tw';
    const currentUrl = `${baseUrl}/${ctx.req.param('category')}/feeds`;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const name = $('a.active-trail').text();
    const items = await Promise.all(
        $('.title a')
            .get()
            .map((item) => {
                const link = baseUrl + $(item).attr('href');
                return cache.tryGet(link, async () => {
                    const response = await got(link);
                    const $ = load(response.data);
                    return {
                        title: $('.page-header').text(),
                        author: $('.author a').text(),
                        description: $('article').eq(0).html(),
                        pubDate: timezone(parseDate($('.created').text(), 'YYYY-MM-DD'), +8),
                        category: name,
                        link,
                    };
                });
            })
    );

    ctx.set('data', {
        title: `${name} | iThome`,
        link: currentUrl,
        description: 'iThome Online 是臺灣第一個網路原生報，提供IT產業即時新聞、企業IT產品報導與測試、技術專題、IT應用報導、IT書訊，以及面向豐富的名家專欄。',
        item: items,
    });
};
