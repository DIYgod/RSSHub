import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const cic_base_url = 'http://cic.tju.edu.cn/';

const getArticle = async (link: string) => {
    try {
        const response = await got(link);
        const $ = load(response.data);
        const dateText = $('.news_info > span').first().text();
        const pubDate = dateText ? timezone(parseDate(dateText, 'YYYY年MM月DD日 HH:mm'), 8) : undefined;
        $('.news_tit, .news_info').remove();
        return { pubDate, description: $('.con_news_body > div').html() ?? undefined };
    } catch {
        // Keep the source listing when an article detail is unavailable.
        return {};
    }
};

const pageType = (href) => {
    if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    return url.hostname === 'cic.tju.edu.cn' ? 'tju-cic' : 'unknown';
};

export const route: Route = {
    path: '/cic/:type?',
    categories: ['university'],
    example: '/tju/cic/news',
    parameters: { type: 'default `news`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'College of Intelligence and Computing',
    maintainers: ['AlanZeng423', 'SuperPung'],
    handler,
    description: `| College News | Notification | TJU Forum for CIC |
| :----------: | :----------: | :---------------: |
|     news     | notification |       forum       |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    let path, subtitle;

    switch (type) {
        case 'news':
            subtitle = '学部新闻';
            path = 'xwzx/xyxw.htm';
            break;
        case 'notification':
            subtitle = '通知公告';
            path = 'xwzx/tzgg.htm';
            break;
        case 'forum':
            subtitle = '北洋智算论坛';
            path = 'byzslt.htm';
            break;
        default:
            subtitle = '学部新闻';
            path = 'xwzx/xyxw.htm';
    }
    const response = await got(cic_base_url + path);
    const $ = load(response.data);
    const list = $('.wenzi_list_ul > li')
        .toArray()
        .map((item): DataItem & { type: string } => {
            const href = $('a', item).attr('href');
            const type = pageType(href);
            return {
                title: $('a', item).text(),
                link: type === 'in-site' ? cic_base_url + href : href,
                type,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            switch (item.type) {
                case 'tju-cic':
                case 'in-site':
                    return { ...item, ...(await cache.tryGet(`tju:cic:article:${item.link}`, () => getArticle(item.link!))) };
                default:
                    return item;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '天津大学智能与计算学部 - ' + subtitle,
        link: cic_base_url + path,
        description: null,
        item: items,
    };
}
