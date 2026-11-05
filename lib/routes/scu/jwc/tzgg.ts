import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器
import pMap from 'p-map';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const baseUrl = 'https://jwc.scu.edu.cn/tzgg.htm';
const baseIndexUrl = 'https://jwc.scu.edu.cn/';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/scu/jwc',
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
            source: ['jwc.scu.edu.cn'],
            target: '/jwc',
        },
    ],
    name: '教务处通知公告',
    maintainers: ['Kyle-You'],
    handler,
};

async function handler() {
    const { data: response } = await got.get(baseUrl);
    const $ = load(response);

    const links: string[] = $('.tz-list ul li a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link: string = $item.attr('href')!;
            return link.startsWith('http') ? link : baseIndexUrl + link;
        });

    const items = await pMap(
        links,
        (link) =>
            cache.tryGet(link, async () => {
                const { data: info } = await got.get(link);
                const $ = load(info);

                // 获取head里的meta标签
                const title = $('head meta[name="ArticleTitle"]').attr('content') ?? '';
                const pubDate = parseDateInTimezone($('head meta[name="PubDate"]').attr('content') ?? '', 8);
                const description = $('.v_news_content').html();
                return {
                    title,
                    link,
                    pubDate,
                    description,
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: '四川大学教务处',
        link: baseIndexUrl,
        description: '四川大学教务处通知公告',
        item: items,
        language: 'zh-CN' as const satisfies Language,
        image: 'https://www.scu.edu.cn/__local/B/67/25/DFAF986CCD6529E52D7830F180D_C37C7DEE_4340.png',
        logo: 'https://www.scu.edu.cn/__local/B/67/25/DFAF986CCD6529E52D7830F180D_C37C7DEE_4340.png',
        icon: 'https://www.scu.edu.cn/__local/B/67/25/DFAF986CCD6529E52D7830F180D_C37C7DEE_4340.png',
    };
}
