import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const yzb_base_url = 'http://yzb.tju.edu.cn/';

const getArticle = async (link: string) => {
    try {
        const response = await got(link, { responseType: 'buffer' });
        const $ = load(iconv.decode(response.data, 'gbk'));
        $('.font_18_b, .font_grey_en').remove();
        return { description: $('.nav_a10 > table > tbody').html() ?? undefined };
    } catch {
        // Keep the source listing when an article detail is unavailable.
        return {};
    }
};

const pageType = (href) => {
    if (href === undefined) {
        return 'unknown';
    }
    if (!href.startsWith('http')) {
        return 'in-site';
    }
    const url = new URL(href);
    return url.hostname === 'yzb.tju.edu.cn' ? 'tju-yzb' : 'unknown';
};

export const route: Route = {
    path: '/yzb/:type?',
    categories: ['university'],
    example: '/tju/yzb/notice',
    parameters: { type: 'default `notice`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Admission Office of Graduate',
    maintainers: ['SuperPung'],
    handler,
    description: `| School-level Notice | Master | Doctor | On-the-job Degree |
| :-----------------: | :----: | :----: | :---------------: |
|        notice       | master | doctor |        job        |`,
};

async function handler(ctx) {
    const { type } = ctx.req.param();
    let path, subtitle;

    switch (type) {
        case 'notice':
            subtitle = '校级公告';
            path = 'xwzx/zxxx/';
            break;
        case 'master':
            subtitle = '统考硕士';
            path = 'xwzx/tkss_xw/';
            break;
        case 'doctor':
            subtitle = '统考博士';
            path = 'xwzx/tkbs_xw/';
            break;
        case 'job':
            subtitle = '在职学位';
            path = 'xwzx/zzxw/';
            break;
        default:
            subtitle = '校级公告';
            path = 'xwzx/zxxx/';
    }
    const response = await got(yzb_base_url + path, {
        responseType: 'buffer',
    });
    const $ = load(iconv.decode(response.data, 'gbk'));
    const list = $('td.table_left_right > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr')
        .slice(1, -1)
        .toArray()
        .map((item): DataItem & { type: string } => {
            const href = $('td > a', item).attr('href');
            const type = pageType(href);
            return {
                title: $('td > a', item).text(),
                link: type === 'in-site' ? yzb_base_url + path + href : href,
                pubDate: timezone(parseDate($('.font_10_time', item).text().slice(2, -2), 'YYYY-MM-DD'), 8),
                type,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            switch (item.type) {
                case 'tju-yzb':
                case 'in-site':
                    return { ...item, ...(await cache.tryGet(`tju:yzb:article:${item.link}`, () => getArticle(item.link!))) };
                default:
                    return item;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '天津大学研究生招生网 - ' + subtitle,
        link: yzb_base_url + path,
        item: items,
    };
}
