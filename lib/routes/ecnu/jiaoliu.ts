import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jiaoliu',
    categories: ['university'],
    example: '/ecnu/jiaoliu',
    radar: [
        {
            source: ['www.jiaoliu.ecnu.edu.cn'],
            target: '/jiaoliu',
        },
    ],
    name: '本科生交流通知',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'http://www.jiaoliu.ecnu.edu.cn/';

        const response = await got(`${baseUrl}11184/list.htm`);
        const $ = load(response.data);
        const links = $('#wp_news_w3 > table > tbody > tr')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('div[style="white-space:nowrap"]').text()), +8),
                link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
                title: $(el).find('a').text(),
            }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data } = await got(item.link);
                    const $ = load(data);
                    const $read = $('div.wp_articlecontent');
                    $read.find('img[src], a[href]').each((i, el) => {
                        const $el = $(el);
                        const attr = el.tagName === 'img' ? 'src' : 'href';
                        const val = $el.attr(attr);
                        if (val) {
                            $el.attr(attr, new URL(val, baseUrl).toString());
                        }
                    });
                    item.description = $read.html()?.trim();
                    return item;
                })
            )
        );

        return {
            title: '本科生交流通知',
            link: baseUrl,
            item: items,
        };
    },
};
