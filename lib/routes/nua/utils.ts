import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { fetchArticle } from '@/utils/wechat-mp';

type NuaItem = DataItem & { link: string; type: 'in-nua' | 'wechat-mp' | 'nua' | 'unknown' };

const collegeGot = got.extend({ allowH2: false });

const pageType = (href: string) => {
    if (!href.startsWith('http')) {
        return 'in-nua';
    }
    const url = new URL(href);
    if (url.hostname === 'mp.weixin.qq.com') {
        return 'wechat-mp';
    }
    if (url.hostname === 'www.nua.edu.cn') {
        return 'nua';
    }
    return 'unknown';
};

function parseListDate(text: string) {
    const date = text.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    if (date) {
        return timezone(parseDate(date, 'YYYY-MM-DD'), 8);
    }
    const parts = text.match(/(\d{2})\s+(\d{4})\/(\d{2})/);
    if (parts) {
        return timezone(parseDate(`${parts[2]}-${parts[3]}-${parts[1]}`, 'YYYY-MM-DD'), 8);
    }
}

async function ProcessList(newsUrl: string, _baseUrl: string, listName: string, listDate: string, webPageName: string): Promise<[NuaItem[], string]> {
    const result = await collegeGot(newsUrl);
    const $ = load(result.data);

    const pageName = $(webPageName).first().text().trim() || $('title').text();

    const items = $(listName)
        .toArray()
        .flatMap((item): NuaItem[] => {
            const anchor = $(item).find('a').first();
            const href = anchor.attr('href');
            if (!href) {
                return [];
            }
            const link = new URL(href, newsUrl);
            if (link.protocol !== 'https:' && link.protocol !== 'http:') {
                return [];
            }
            const type = pageType(href);
            const dateText = $(item).find(listDate).first().text();

            return [
                {
                    link: link.href,
                    title: anchor.attr('title') || anchor.text(),
                    pubDate: parseListDate(dateText),
                    type,
                },
            ];
        });

    return [items, pageName];
}

const ProcessFeed = (items: NuaItem[], artiContent: string) =>
    pMap(
        items,
        async (item) => {
            const { type, ...listItem } = item;
            switch (type) {
                case 'in-nua':
                case 'nua': {
                    const article = await cache.tryGet(`nua:article:${item.link}`, async () => {
                        const result = await collegeGot(item.link);
                        const $ = load(result.data);
                        return {
                            author:
                                $('.arti_publisher')
                                    .text()
                                    .replace(/^(?:来源|发布者)：/, '') || undefined,
                            description: $(artiContent).html(),
                        };
                    });
                    return { ...listItem, ...article };
                }
                case 'wechat-mp':
                    return fetchArticle(item.link);
                case 'unknown':
                default:
                    return listItem;
            }
        },
        { concurrency: 3 }
    );

export default { ProcessList, ProcessFeed };
