import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const type = (filename) => filename.split('.').pop();

export const route: Route = {
    path: '/dxb',
    categories: ['university'],
    example: '/ecnu/dxb',
    radar: [
        {
            source: ['dxb.ecnu.edu.cn'],
            target: '/dxb',
        },
    ],
    name: '地球科学学部通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://dxb.ecnu.edu.cn/';

        const response = await got(`${baseUrl}18277/list.htm`);
        const $ = load(response.data);
        const links = $('ul.news_list > li')
            .toArray()
            .map((el) => ({
                pubDate: timezone(parseDate($(el).find('.news_meta').text()), +8),
                link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
                title: $(el).find('a').text(),
            }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    if (type(item.link) === 'htm') {
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
                    } else {
                        // file to download
                        item.description = '请到原网页访问';
                        return item;
                    }
                })
            )
        );

        return {
            title: '地球科学学部通知公告',
            link: 'https://dxb.ecnu.edu.cn/18277/list.htm',
            item: items,
        };
    },
};
