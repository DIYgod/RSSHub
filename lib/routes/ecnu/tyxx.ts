import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tyxx',
    categories: ['university'],
    example: '/ecnu/tyxx',
    radar: [
        {
            source: ['tyxx.ecnu.edu.cn'],
            target: '/tyxx',
        },
    ],
    name: '体育与健康学院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://tyxx.ecnu.edu.cn/';

        const response = await got(`${baseUrl}37979/list.htm`);
        const $ = load(response.data);
        const links = $('ul.news_list.list2 > li')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('.news_meta').text()), +8),
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
            title: '体育与健康学院通知公告',
            link: 'https://tyxx.ecnu.edu.cn/37979/list.htm',
            item: items,
        };
    },
};
