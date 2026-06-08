import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
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

async function fetchPage(url: string) {
    const raw = await ofetch(url, { responseType: 'arrayBuffer' });
    const decoder = new TextDecoder('shift-jis');
    return decoder.decode(raw as ArrayBuffer);
}

async function handler(ctx: Context) {
    const limit = Number.parseInt(ctx.req.query('limit') || '24', 10);
    const baseUrl = 'https://www.mhlw.go.jp';
    const link = `${baseUrl}/toukei/list/30-1a.html`;

    const response = await fetchPage(link);
    const $ = load(response);

    const list: DataItem[] = $('table.xgengo:first tr')
        .toArray()
        .flatMap((row) => {
            const $row = $(row);
            const year = $row.find('h3').text().trim();
            return $row
                .find('ul.ico-link li a')
                .toArray()
                .map((a) => {
                    const $a = $(a);
                    return {
                        title: `${year}${$a.text().trim()}`,
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

                const dateText = $('.prt-topContents .al-right').text().trim();
                const cleanedDate = dateText.replaceAll(/（[^）]+）/g, '');
                const content = $('#contentsInner');
                content.find('.prt-topContents, .prt-linkNavi, .prt-plugin').remove();

                item.title = $('h1#pageTitle').text().trim() || item.title;
                item.pubDate = timezone(parseDate(cleanedDate, 'YYYY年M月D日'), 9);
                item.description = content.html()?.trim();

                return item;
            })
        )
    );

    return {
        title: $('head title').text().trim(),
        description: $('meta[name="description"]').attr('content')?.trim(),
        link,
        image: `${baseUrl}/favicon.ico`,
        language: $('html').attr('lang'),
        item: items,
    };
}
