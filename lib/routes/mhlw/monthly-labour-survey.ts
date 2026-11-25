import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { calendarToInstant, parseDate } from '@/utils/time';

export const route: Route = {
    path: '/monthly-labour-survey',
    categories: ['government'],
    example: '/mhlw/monthly-labour-survey',
    radar: [
        {
            source: ['www.mhlw.go.jp/toukei/list/30-1a.html'],
        },
    ],
    name: '毎月勤労統計調査 全国調査（月別結果）',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.mhlw.go.jp/toukei/list/30-1a.html',
};

const parseJapaneseDate = (text: string) => {
    const normalized = text
        .replaceAll(/（[^）]+）/g, '')
        // oxlint-disable-next-line regexp/no-obscure-range
        .replaceAll(/[０-９]/g, (c) => String.fromCodePoint(c.codePointAt(0)! - 0xfee0));
    const match = /^令和\s*(元|\d+)\s*年\s*(\d+)\s*月\s*(\d+)\s*日/.exec(normalized);
    return match ? calendarToInstant({ calendar: 'japanese', era: 'reiwa', year: match[1] === '元' ? 1 : match[1], month: match[2], day: match[3] }, 9) : parseDate(normalized, 'YYYY年M月D日', 9);
};

async function fetchPage(url: string) {
    const raw = await ofetch<ArrayBuffer, 'arrayBuffer'>(url, { responseType: 'arrayBuffer' });
    const decoder = new TextDecoder('shift-jis');
    return decoder.decode(raw);
}

async function handler(ctx: Context) {
    const limit = getRouteLimit(ctx, 24);
    const baseUrl = 'https://www.mhlw.go.jp';
    const link = `${baseUrl}/toukei/list/30-1a.html`;

    const response = await fetchPage(link);
    const $ = load(response);

    const list: DataItem[] = $('table.xgengo:first tr')
        .toArray()
        .flatMap((row) => {
            const $row = $(row);
            const year = $row.find('h3').text();
            return $row
                .find('ul.ico-link li a')
                .toArray()
                .map((a) => {
                    const $a = $(a);
                    return {
                        title: `${year}${$a.text()}`,
                        link: new URL($a.attr('href')!, baseUrl).href,
                    };
                })
                .toReversed();
        })
        .slice(0, limit);

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet<{ title?: string; pubDate: DataItem['pubDate']; description?: string }>(`mhlw:detail:${item.link}`, async () => {
                const response = await fetchPage(item.link!);
                const $ = load(response);
                const dateText = $('.prt-topContents .al-right').text();
                const title = $('h1#pageTitle').text();
                const content = $('#contentsInner');
                content.find('.prt-topContents, .prt-linkNavi, .prt-plugin').remove();
                return {
                    title: /\S/.test(title) ? title : undefined,
                    pubDate: parseJapaneseDate(dateText),
                    description: content.html()?.trim(),
                };
            });
            return { ...item, title: detail.title || item.title, pubDate: detail.pubDate, description: detail.description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        image: `${baseUrl}/favicon.ico`,
        language: $('html').attr('lang') as Language,
        item: items,
    };
}
