import path from 'node:path';

import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

import { namespace } from './namespace';

const baseUrl = `https://${namespace.url}`;

function parseRocDate(rocDate: string | undefined): Date | undefined {
    if (!rocDate) {
        return undefined;
    }
    // Expect formats like 114/08/31
    const parts = rocDate.trim().split('/');
    if (parts.length !== 3) {
        return undefined;
    }
    const [rocYearStr, monthStr, dayStr] = parts;
    const rocYear = Number.parseInt(rocYearStr, 10);

    const year = rocYear + 1911;
    return parseDate(`${year}-${monthStr}-${dayStr}`, 'YYYY-MM-DD');
}

export const route: Route = {
    path: '/',
    categories: ['government'],
    example: '/scitechvista',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['scitechvista.nat.gov.tw/'],
        },
    ],
    name: '最新文章',
    maintainers: ['johan456789'],
    handler,
    url: namespace.url,
};

async function handler(): Promise<Data> {
    const currentUrl = `${baseUrl}/Article/C000003/new`;
    const html = await ofetch(currentUrl);
    const $ = load(html);

    const language: string = $('html').attr('lang') || 'zh-TW';
    const articleNodes = $('div.kf-diagramtext-list > div.kf-diagramtext-col').toArray();

    const items: DataItem[] = articleNodes
        .map((colEl) => {
            const node = $(colEl);
            const anchor = node.find('a[href*="/Article/C000003/detail"]').first();

            const linkPath = anchor.attr('href');
            const link = linkPath ? new URL(linkPath, baseUrl).href : undefined;

            const title = node.find('div.kf-title').first().text().trim();

            const dateText = node.find('div.kf-date > span').first().text().trim() || undefined;
            const pubDate = dateText ? timezone(parseRocDate(dateText), +8) : undefined;

            const imagePath = node.find('img').attr('src');
            const image = imagePath ? new URL(imagePath, baseUrl).href : undefined;

            const snippet = node.find('div.kf-txt').first().text().trim() || undefined;

            const description = art(path.join(__dirname, 'templates/description.art'), {
                image,
                description: snippet,
            });

            return {
                title,
                description,
                link,
                pubDate,
                image,
            } as DataItem;
        })
        .filter(Boolean) as DataItem[];

    return {
        title: `${namespace.name} - 最新文章`,
        link: currentUrl,
        language,
        item: items,
    } as Data;
}
