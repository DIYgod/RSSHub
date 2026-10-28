import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getArticleContent, getArticlePubDate } from './utils';

const host = 'https://ylxx.szftedu.cn/xx_5828/xygg_5832/';

export const route: Route = {
    path: '/gonggao',
    categories: ['university'],
    example: '/szftedu/gonggao',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公告',
    maintainers: ['valuex'],
    handler,
    description: '',
};

async function getArticle(link: string): Promise<Partial<DataItem>> {
    const trueLink = link.startsWith('http') ? link : host + link.slice(1);
    const response = await got(trueLink);
    const $ = load(response.data);
    const item: Partial<DataItem> = { description: link.startsWith('http') ? await getArticleContent($, trueLink) : $('div.TRS_Editor').html() };
    const articleDate = link.startsWith('http') ? await getArticlePubDate($) : undefined;
    const date = $('.item').first().text().replace('发布时间：', '').trim();
    if (articleDate) {
        item.pubDate = articleDate;
    } else if (date) {
        item.pubDate = timezone(parseDate(date), 8);
    }
    return item;
}

async function handler() {
    const link = host;
    const response = await got(link);
    const $ = load(response.data);

    const lists = $('div.pagenews04 div ul li')
        .toArray()
        .map((el): DataItem => {
            const date = $('span[class=canedit]', el).text().trim();
            return {
                title: $('a', el).text(),
                link: $('a', el).attr('href'),
                pubDate: date ? timezone(parseDate(date), 8) : undefined,
            };
        });

    const items = await pMap(lists, async (item) => ({ ...item, ...(await cache.tryGet(`szftedu:gonggao:article:${item.link}`, () => getArticle(item.link!))) }), { concurrency: 3 });

    return {
        title: '园岭小学公告',
        link: host,
        description: '园岭小学公告',
        item: items,
    };
}
