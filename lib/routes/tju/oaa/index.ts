import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { finishArticleItem } from '@/utils/wechat-mp';

const oaa_base_url = 'http://oaa.tju.edu.cn/';

const getArticle = async (link: string) => {
    try {
        const response = await got(link);
        const $ = load(response.data);
        return { description: $('.v_news_content').html() ?? undefined };
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
    if (url.hostname === 'mp.weixin.qq.com') {
        return 'wechat-mp';
    }
    if (url.hostname === 'oaa.tju.edu.cn') {
        return 'tju-oaa';
    }
    return 'unknown';
};

export const route: Route = {
    path: '/oaa/:type?',
    categories: ['university'],
    example: '/tju/oaa/news',
    parameters: { type: 'default `news`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'The Office of Academic Affairs',
    maintainers: ['AlanZeng423', 'AmosChenYQ', 'SuperPung'],
    handler,
    description: `| News | Notification |
| :--: | :----------: |
| news | notification |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    let path, subtitle;

    switch (type) {
        case 'news':
            subtitle = '新闻动态';
            path = 'xwdt.htm';
            break;
        case 'notification':
            subtitle = '通知公告';
            path = 'tzgg.htm';
            break;
        default:
            subtitle = '新闻动态';
            path = 'xwdt.htm';
    }
    const response = await got(oaa_base_url + path, {
        headers: {
            Referer: oaa_base_url,
        },
    });
    const $ = load(response.data);
    const list = $('.notice_l > ul > li > dl > dt')
        .toArray()
        .map((item): DataItem & { type: string } => {
            const href = $('a', item).attr('href');
            const type = pageType(href);
            return {
                title: $('h2', item).text(),
                link: type === 'in-site' ? oaa_base_url + href : href,
                pubDate: timezone(parseDate($('.fl_01_r_time', item).text(), 'DDYYYY-MM'), 8),
                type,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            switch (item.type) {
                case 'wechat-mp':
                    return finishArticleItem(item);
                case 'tju-oaa':
                case 'in-site':
                    return { ...item, ...(await cache.tryGet(`tju:oaa:article:${item.link}`, () => getArticle(item.link!))) };
                default:
                    return item;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '天津大学教务处 - ' + subtitle,
        link: oaa_base_url + path,
        description: null,
        item: items,
    };
}
