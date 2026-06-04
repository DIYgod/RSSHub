import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/sei',
    categories: ['university'],
    example: '/ecnu/sei',
    radar: [
        {
            source: ['sei.ecnu.edu.cn'],
            target: '/sei',
        },
    ],
    name: '软件工程学院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://sei.ecnu.edu.cn/';

        const response = await got(`${baseUrl}33171/list.htm`);
        const $ = load(response.data);
        const links = $('ul.data-list > li')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('.data-list-time').text()), +8),
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
            title: '软件工程学院通知公告',
            link: 'http://www.sei.ecnu.edu.cn/33171/list.htm',
            item: items,
        };
    },
};
