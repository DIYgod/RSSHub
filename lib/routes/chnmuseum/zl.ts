import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

// Formatting Function: Returns YYYY-MM-DD only if there are 3 valid numeric segments; otherwise, returns undefined.
const formatExhibitionDate = (dateStr: string | undefined): string | undefined => {
    if (!dateStr) {
        return undefined;
    }
    const normalized = dateStr
        .replaceAll(/年|月/g, '-')
        .replaceAll('日', '')
        .replaceAll('/', '-')
        .replaceAll('.', '-');
    const parts = normalized.split('-').filter(Boolean);
    if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    return undefined;
};

const parseExhibitionDuration = (duration: string) => {
    // Remove all spaces and parentheses to prevent regex matching from breaking
    const cleanStr = duration
        .replaceAll(/\s+/g, '')
        .replaceAll(/（[^）]*）/g, '')
        .trim();

    // Match YYYY-MM-DD or MM-DD
    const dateRegex = /(\d{4}[./年-]\d{1,2}[./月-]\d{1,2}日?)|(\d{1,2}[./月-]\d{1,2}日?)/g;
    const allDates = cleanStr.match(dateRegex) || [];

    let startDateRaw: string | undefined;
    let endDateRaw: string | undefined;

    if (cleanStr.startsWith('展至') && allDates.length > 0) {
        endDateRaw = allDates[0];
    } else if (allDates.length >= 2) {
        startDateRaw = allDates[0];
        let rawEnd = allDates[1];
        // Logic to complete the year
        if (!/\d{4}/.test(rawEnd) && startDateRaw) {
            const startYear = startDateRaw.match(/^\d{4}/);
            if (startYear) {
                const sep = startDateRaw.includes('年') ? '年' : (startDateRaw.includes('/') ? '/' : '-');
                rawEnd = `${startYear[0]}${sep}${rawEnd}`;
            }
        }
        endDateRaw = rawEnd;
    } else if (allDates.length === 1) {
        if (cleanStr.includes('展至')) {
            endDateRaw = allDates[0];
        } else {
            startDateRaw = allDates[0];
        }
    }

    return {
        startDate: formatExhibitionDate(startDateRaw),
        endDate: formatExhibitionDate(endDateRaw)
    };
};

export const route: Route = {
    path: '/zl',
    categories: ['travel'],
    example: '/chnmuseum/zl',
    // Use Chnmuseum English version channel name
    name: 'Current Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.chnmuseum.cn/zl/'],
            target: '/zl',
        },
    ],
    handler: async (_ctx: Context): Promise<Data> => {
        const baseUrl = 'https://www.chnmuseum.cn';
        const url = `${baseUrl}/zl/`;

        const response = await got(url);
        const $ = load(response.data);

        const list: DataItem[] = await Promise.all(
            $('ul#div li').toArray().map(async (item) => {
                const $item = $(item);

                const rawLink = $item.find('a.recurl').attr('href') || '';
                const itemLink = rawLink.startsWith('.') ? new URL(rawLink, url).href : `${baseUrl}${rawLink}`;

                const museumName = namespace.zh?.name || namespace.name;
                const title = $item.find('div.cj_zxx3 p').text();
                const imgUrl = new URL($item.find('img').first().attr('src') || '', url).href;
                const location = $item.find('div.cj_zxx1').text().trim();

                let fullDuration = $item.find('div.cj_zxx2 p').text().trim();

                // --- Check if the text ends with "..." If so, proceed to fetch the full version. ---
                if (fullDuration.endsWith('...')) {
                    fullDuration = await cache.tryGet(itemLink, async () => {
                        const detailResponse = await got(itemLink);
                        const html = detailResponse.data;
                        const dateRegex = /var\s+qtxszq\s*=\s*"(.*?)";/;
                        const match = html.match(dateRegex);
                        return match && match[1] ? match[1] : fullDuration;
                    }) as string;
                }

                const { startDate, endDate } = parseExhibitionDuration(fullDuration);

                // Variable Handling: If the value is `undefined`, it remains `undefined` to facilitate subsequent processing by the Calendar component.
                const pubDate = startDate ? parseDate(startDate) : undefined;

                const $desc = load('<div></div>', null, false);

                if (imgUrl) {
                    $desc('div').append(`<img src="${imgUrl}">`);
                    $desc('div').append('<br>');
                }
                $desc('div').append(`<p><b>地点：</b>${location}</p>`);
                $desc('div').append(`<p><b>开展：</b>${startDate ?? '未定/常设'}</p>`);
                $desc('div').append(`<p><b>闭展：</b>${endDate ?? '未定/常设'}</p>`);

                if (fullDuration) {
                    $desc('div').append(`<p><small>原始展期：${fullDuration}</small></p>`);
                }

                return {
                    title,
                    link: itemLink,
                    pubDate,
                    description: $desc.html(),
                    // For further processing, keep the fixed format
                    _extra: {
                        museumName,
                        title,
                        location,
                        startDate,
                        endDate,
                        itemLink
                    }
                };
            })
        );

        return {
            title: '中国国家博物馆 - 正在展出',
            link: url,
            language: 'zh-CN',
            item: list,
        };
    },
};
