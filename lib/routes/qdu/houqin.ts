import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base = 'https://houqin.qdu.edu.cn/';

export const route: Route = {
    path: '/houqin',
    categories: ['university'],
    example: '/qdu/houqin',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['houqin.qdu.edu.cn/index/tzgg.htm', 'houqin.qdu.edu.cn/'],
        },
    ],
    name: '后勤管理处通知',
    maintainers: ['abc1763613206'],
    handler,
    url: 'houqin.qdu.edu.cn/index/tzgg.htm',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: `${base}index/tzgg.htm`,
    });

    const $ = load(response.data);
    const list = $('.n_newslist')
        .children()
        .toArray()
        .flatMap((item) => {
            const href = $(item).find('a').attr('href');
            if (!href) {
                return [];
            }
            const link = new URL(href, `${base}index/tzgg.htm`);
            if (!['http:', 'https:'].includes(link.protocol)) {
                return [];
            }
            return { element: item, link: link.href };
        });
    const items = await pMap(
        list,
        (item) => {
            const $item = $(item.element);
            const itemTitle = $item.find('a').text();
            let itemDate = timezone(parseDate($item.find('span').text()), 8);
            const itemUrl = item.link;
            return cache.tryGet(itemUrl, async () => {
                const result = await got(itemUrl);
                const $ = load(result.data);
                if (
                    $('.article_body')
                        .find('div > h4')
                        .text()
                        .match(/发布时间：(.*)编辑：/) !== null
                ) {
                    itemDate = timezone(
                        parseDate(
                            $('.article_body')
                                .find('div > h4')
                                .text()
                                .match(/发布时间：(.*)编辑：/)![1]
                                .trim(),
                            'YYYY年MM月DD日 HH:mm'
                        ),
                        8
                    );
                }
                const description = $('.v_news_content').html()?.trim();

                return {
                    title: itemTitle,
                    link: itemUrl,
                    pubDate: itemDate,
                    description,
                };
            });
        },
        { concurrency: 3 }
    );

    return {
        title: '青岛大学 - 后勤管理处通知',
        link: `${base}index/tzgg.htm`,
        description: '青岛大学 - 后勤管理处通知',
        item: items,
    };
}
