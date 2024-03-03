// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') || '3157';

    const rootUrl = 'https://www.sqmc.edu.cn';
    const currentUrl = `${rootUrl}/${category}/list.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $('div#wp_news_w9 ul li').get();

    ctx.set('data', {
        title: `新乡医学院三全学院官网信息${$('title').text()}`,
        link: currentUrl,
        item: await Promise.all(
            list.map(async (item) => {
                item = $(item);

                const link = new URL(item.find('dt a').attr('href'), rootUrl).href;
                const pubDate = parseDate(item.find('dd').eq(0).text(), 'YYYY-MM-DD');

                const cacheIn = await cache.tryGet(link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: link,
                    });
                    const content = load(detailResponse.data);

                    return {
                        title: item.find('dt a').text(),
                        description: content('div.Tr_Detail').html(),
                        link,
                        pubDate: timezone(pubDate, +8),
                    };
                });

                return cacheIn;
            })
        ),
    });
};
