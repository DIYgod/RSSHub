import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
        .replaceAll(/[０-９]/g, (c) => String.fromCodePoint(c.codePointAt(0)! - 0xfee0))
        .replace(/^令和(\d+)年/, (_, year) => `${Number(year) + 2018}年`);
    return parseDate(normalized, 'YYYY年M月D日');
};

async function fetchPage(url: string) {
    const raw = await ofetch<ArrayBuffer, 'arrayBuffer'>(url, { responseType: 'arrayBuffer' });
    const decoder = new TextDecoder('shift-jis');
    return decoder.decode(raw);
}

async function handler(ctx: Context) {
    const limit = Number(ctx.req.query('limit') || '24');
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

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await fetchPage(item.link!);
                const $ = load(response);

                const dateText = $('.prt-topContents .al-right').text();
                const content = $('#contentsInner');
                content.find('.prt-topContents, .prt-linkNavi, .prt-plugin').remove();

                item.title = $('h1#pageTitle').text().trim() || item.title;
                item.pubDate = timezone(parseJapaneseDate(dateText), 9);
                item.description = content.html()?.trim();

                return item;
            })
        )
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
