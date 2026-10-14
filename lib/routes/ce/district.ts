import { load } from 'cheerio';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/district/:category?',
    name: '地方经济',
    url: 'district.ce.cn',
    maintainers: ['cscnk52'],
    handler,
    example: '/ce/district',
    parameters: { category: '栏目标识，默认为 roll（即时新闻）' },
    description: `| 即时新闻 | 经济动态 | 独家视角 | 专题 | 数说地方 | 地方播报 |
| -------- | -------- | -------- | ---- | -------- | -------- |
| roll     | jjdt     | poll     | ch   | ssdf     | dfbb     |`,
    categories: ['traditional-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['district.ce.cn/newarea/:category/index.shtml'],
            target: '/district/:category?',
        },
        {
            source: ['district.ce.cn/newarea/:category'],
            target: '/district/:category?',
        },
        {
            source: ['district.ce.cn'],
            target: '/district',
        },
    ],
    view: ViewType.Articles,
};

async function handler(ctx) {
    const rootUrl = 'http://district.ce.cn/';
    const { category = 'roll' } = ctx.req.param();
    if (category === 'zg' || category === 'gat') {
        throw new NotFoundError('This district category has been retired. Choose roll, jjdt, poll, ch, ssdf or dfbb.');
    }
    const url = `${rootUrl}newarea/${category}/index.shtml`;
    const response = await fetchHtml(url);
    const $ = load(response);

    const bigTitle = $('div.channl a').eq(1).attr('title') || $('title').text().split('_', 1)[0];

    const entries = $('.news_items li').length ? $('.news_items li') : $('div.sec_left li');
    const list = entries.toArray().map((e): DataItem => {
        const element = $(e);
        const anchor = element.find('h3 a[href]').length ? element.find('h3 a[href]') : element.find('a[href]').first();
        const title = anchor.attr('title') || anchor.text();
        const link = new URL(anchor.attr('href')!, url).href;
        return {
            title,
            link,
        };
    });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await fetchHtml(item.link!);
                const $ = load(response);

                const pubDateText = $('span#articleTime').text().trim();
                item.pubDate = pubDateText ? timezone(parseDate(pubDateText, 'YYYY年MM月DD日 HH:mm'), 8) : undefined;

                item.description = $('div.TRS_Editor').html() || $('#articleText .TRS_UEDITOR').html();
                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: `中国经济网地方经济 - ${bigTitle}`,
        link: url,
        item: items,
    };
}

async function fetchHtml(url: string) {
    const response = await ofetch(url, { responseType: 'arrayBuffer' });
    const bytes = new Uint8Array(response);
    const head = new TextDecoder().decode(bytes.subarray(0, 4096));
    const encoding = head.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1] || 'gb2312';
    return new TextDecoder(encoding).decode(bytes);
}
