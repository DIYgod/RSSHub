// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const currentUrl = 'https://www.scvtc.edu.cn/ggfw1/xygg.htm';
    const response = await got(currentUrl);
    const $ = load(response.data);
    const list = $('div.text-list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), currentUrl).href,
                pubDate: parseDate(item.find('span').text().trim()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('#vsb_content').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        decription: $('meta[name=description]').attr('content'),
        link: currentUrl,
        item: items,
    });
};
