import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/bksy',
    categories: ['university'],
    example: '/ecnu/bksy',
    radar: [
        {
            source: ['bksy.ecnu.edu.cn'],
            target: '/bksy',
        },
    ],
    name: '本科生院通知',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://bksy.ecnu.edu.cn/';

        const response = await got(`${baseUrl}tzggwwxsgg/list.htm`);
        const $ = load(response.data);
        const links = $('ul.news_list.list2 > li')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('.news_date').text()), +8),
                link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
                title: $(el).find('.news_title').text(),
            }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data } = await got(item.link);
                    const $ = load(data);
                    const $read = $('div.read');
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
            title: '本科生院通知',
            link: 'https://bksy.ecnu.edu.cn/tzggwwxsgg/list.htm',
            item: items,
        };
    },
};
