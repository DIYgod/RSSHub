import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cxcy/:type?',
    categories: ['university'],
    example: '/ecnu/cxcy',
    parameters: { type: '默认为 announcement' },
    radar: [
        {
            source: ['cxcy.ecnu.edu.cn'],
            target: '/cxcy',
        },
    ],
    name: '本科创新创业教育网',
    maintainers: ['FrozenStarrrr', 'ChiyoYuki', 'ECNU-minus'],
    description: `| 通知公告     | 新闻动态     | 学科竞赛     | 常用资源     |
| ------------ | ------------ | ------------ | ------------ |
| announcement | news         | contest      | resources    |`,
    handler: async (ctx) => {
        const fragList = {
            announcement: {
                session: '通知公告',
                frag: '窗口121',
            },
            news: {
                session: '新闻动态',
                frag: '窗口123',
            },
            contest: {
                session: '学科竞赛',
                frag: '窗口124',
            },
            resources: {
                session: '常用资源',
                frag: '窗口125',
            },
        };
        const type = ctx.req.param('type') ?? 'announcement';
        const baseUrl = 'http://www.cxcy.ecnu.edu.cn/';

        const response = await got(baseUrl);
        const $ = load(response.data);

        const filteredEls = $(`div.limit_style1[frag="${fragList[type].frag}"]`).find('table > tbody > tr > td').toArray();
        const links = filteredEls.map((el) => ({
            pubDate: timezone(parseDate($(el).find('.data').text()), +8),
            link: new URL($(el).find('a').attr('href'), baseUrl).toString(),
            title: $(el).find('.news_title').text(),
        }));
        const items = await Promise.all(
            links.map((item) =>
                cache.tryGet(item.link, async () => {
                    if (item.link.split('.').pop() === 'htm') {
                        const { data } = await got(item.link);
                        const $ = load(data);
                        const $read = $('div.wp_articlecontent').length > 0 ? $('div.wp_articlecontent') : $('div.m3nEditor');
                        $read.find('img[src], a[href]').each((_, el) => {
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
            title: fragList[type].session,
            link: baseUrl,
            item: items,
        };
    },
};
