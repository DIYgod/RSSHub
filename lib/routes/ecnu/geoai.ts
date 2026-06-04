import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const type = (filename) => filename.split('.').pop();

export const route: Route = {
    path: '/geoai',
    categories: ['university'],
    example: '/ecnu/geoai',
    radar: [
        {
            source: ['geoai.ecnu.edu.cn'],
            target: '/geoai',
        },
    ],
    name: '空间人工智能学院通知公告',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    handler: async () => {
        const baseUrl = 'https://geoai.ecnu.edu.cn/';

        const response = await got(`${baseUrl}tzgg/list.htm`);
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
                    } else {
                        // file to download
                        item.description = '点击认证后访问内容';
                        return item;
                    }
                })
            )
        );

        return {
            title: '空间人工智能学院通知公告',
            link: 'https://geoai.ecnu.edu.cn/tzgg/list.htm',
            item: items,
        };
    },
};
