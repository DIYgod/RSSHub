import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface idNameMap {
    type: string;
    name: string;
    nodeId: string;
    suffix?: string;
}

interface ArticleList {
    status: string;
    totalPages: number;
    body: string;
}

interface UserArticleList {
    status: string;
    body: string;
    total: number;
}

export const getArticleList = async (nodeId) => {
    const response = await ofetch<ArticleList>(
        `https://db2.gamersky.com/LabelJsonpAjax.aspx?${new URLSearchParams({
            jsondata: JSON.stringify({
                type: 'updatenodelabel',
                isCache: true,
                cacheTime: 60,
                nodeId,
                isNodeId: 'true',
                page: 1,
            }),
        })}`,
        {
            parseResponse: (txt) => JSON.parse(txt.match(/\((.+)\);/)?.[1] ?? '{}'),
        }
    );
    return response.body;
};

export const parseArticleList = (response: string) => {
    const $ = load(response);
    return $('li')
        .toArray()
        .map((item) => {
            const ele = $(item);
            const a = ele.find('.tt').length ? ele.find('.tt') : ele.find('a');
            const title = a.text();
            const link = a.attr('href');
            const pubDate = timezone(parseDate(ele.find('.time').text()), 8);
            const description = ele.find('.txt').text();
            if (!link) {
                return;
            }
            return {
                title,
                link,
                pubDate,
                description,
            };
        })
        .filter((item) => item !== undefined) satisfies DataItem[];
};

const getArticle = async (item: DataItem): Promise<DataItem> => {
    const detail = await cache.tryGet(`${item.link}#article-body`, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        const content = $('.Mid2L_con, .MidLcon');
        content.find('.appGameBuyCardIframe, .GSAppButton, .Mid2L_down').remove();
        content.find('a').each((_, item) => {
            if (item.attribs.href?.startsWith('https://www.gamersky.com/showimage/id_gamersky.shtml?')) {
                item.attribs.href = item.attribs.href.replace('https://www.gamersky.com/showimage/id_gamersky.shtml?', '');
            }
        });
        content.find('img').each((_, item) => {
            if (item.attribs.src === 'http://image.gamersky.com/webimg13/zhuanti/common/blank.png') {
                item.attribs.src = item.attribs['data-origin'];
            } else if (item.attribs.src.endsWith('_S.jpg')) {
                item.attribs.src = item.attribs.src.replace('_S.jpg', '.jpg');
            }
        });
        content.find('.Slides li').each((_, item) => {
            if (item.attribs.style === 'display: none;') {
                item.attribs.style = 'display: list-item;';
            }
        });
        return { description: content.html() };
    });
    return { ...item, description: detail.description || item.description };
};

export const getArticles = (list: DataItem[]): Promise<DataItem[]> => pMap(list, getArticle, { concurrency: 3 });

export const getUserArticleList = async (userId: string) => {
    const response = await ofetch<UserArticleList>(
        `https://i.gamersky.com/u/api/v2/GetUserContent?${new URLSearchParams({
            jsondata: JSON.stringify({ pageIndex: 1, pageSize: 20, userId }),
        })}`,
        {
            parseResponse: (txt) => JSON.parse(txt.slice(1, -2)),
        }
    );
    return response.body;
};

function parseUserTimestamp(timestamp?: string): Date | undefined {
    if (!timestamp) {
        return;
    }
    const date = parseDate(timestamp);
    if (!Number.isFinite(date.getTime())) {
        return;
    }
    return /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?$/.test(timestamp) ? timezone(date, 8) : date;
}

export const parseUserArticleList = (body: string) => {
    const $ = load(body);
    const list = $('.cmt-list');
    const info = list.find('.uname').first();
    const items: DataItem[] = list.toArray().map((item) => {
        const e = $(item);
        const title = e.find('.qzcmt-content-tit a');
        return {
            title: title.text(),
            link: title.attr('href'),
            pubDate: parseUserTimestamp(e.attr('data-time')),
            description: e.find('.qzcmt-content-txt span').text(),
        };
    });
    return {
        uname: info.text(),
        link: info.attr('href'),
        list: items,
    };
};

export const getUserArticle = async (item: DataItem): Promise<DataItem> => {
    const detail = await cache.tryGet(`${item.link}#user-article-body`, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        return { description: $('.qzcmt-content-txt').html() };
    });
    return { ...item, description: detail.description || item.description };
};

export function mdTableBuilder(data: idNameMap[]) {
    const table = '|' + data.map((item) => `${item.type}|`).join('') + '\n|' + Array.from({ length: data.length }, () => '---|').join('') + '\n|' + data.map((item) => `${item.name}|`).join('') + '\n';
    return table;
}
