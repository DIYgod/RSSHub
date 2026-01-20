import { load } from 'cheerio';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

dayjs.extend(customParseFormat);

export const route: Route = {
    name: 'Futu Morning Post',
    categories: ['finance'],
    maintainers: ['raxod502'],
    path: '/post',
    example: '/futu/post',
    handler,
    radar: [
        {
            source: ['news.futunn.com/news-topics/162/futu-morning-post/'],
            target: '/futu/post',
        },
    ],
};

async function handler() {
    const baseUrl = 'https://news.futunn.com/news-topics/162/futu-morning-post/';
    const response = await ofetch(baseUrl);
    const $ = load(response);

    const items = $('.related-news .news-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('.title').first().text();
            const timeText = $item.find('.time').first().text();
            const pubDate = parseTime(timeText);
            let link = $item.find('a').first().attr('href');
            if (link) {
                try {
                    link = new URL(link, baseUrl).href;
                } catch {
                    // Invalid URL, keep original
                }
            }
            return {
                title,
                link,
                pubDate,
            };
        });

    return {
        title: 'Futu Morning Post',
        link: baseUrl,
        item: items,
    };
}

function parseTime(timeText: string): Date | undefined {
    const trimmedText = timeText.trim();

    // Handle relative time like "47分钟前"
    if (/^\d+\s*(分钟|小时|天|秒)[钟鐘]?前/.test(trimmedText)) {
        const relativeDate = parseRelativeDate(trimmedText);
        return relativeDate instanceof Date ? timezone(relativeDate, +8) : undefined;
    }
    // Handle format like "01/19 08:20" (MM/DD HH:mm)
    if (/^\d{2}\/\d{2}\s+\d{2}:\d{2}$/.test(trimmedText)) {
        const currentYear = dayjs().year();
        const parsed = dayjs(`${currentYear}/${trimmedText}`, 'YYYY/MM/DD HH:mm', true);
        return parsed.isValid() ? timezone(parsed.toDate(), +8) : undefined;
    }
    // Handle format like "08:09" (HH:mm) - assume today
    if (/^\d{2}:\d{2}$/.test(trimmedText)) {
        const today = dayjs().format('YYYY-MM-DD');
        const parsed = dayjs(`${today} ${trimmedText}`, 'YYYY-MM-DD HH:mm', true);
        return parsed.isValid() ? timezone(parsed.toDate(), +8) : undefined;
    }
    // Try standard parseDate
    try {
        return timezone(parseDate(trimmedText), +8);
    } catch {
        const relativeDate = parseRelativeDate(trimmedText);
        return relativeDate instanceof Date ? timezone(relativeDate, +8) : undefined;
    }
}
