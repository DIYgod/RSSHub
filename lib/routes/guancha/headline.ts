// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://www.guancha.cn';
    const currentUrl = `${rootUrl}/GuanChaZheTouTiao/list_1.shtml`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.headline-list li .content-headline h3 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                description: item.parent().next().html(),
                link: `${rootUrl}${item.attr('href').replace(/\.shtml$/, '_s.shtml')}`,
                pubDate: timezone(parseDate(item.parents('div').first().find('span').text()), +8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description += content('.all-txt').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '观察者网 - 头条',
        link: currentUrl,
        item: items,
    });
};
