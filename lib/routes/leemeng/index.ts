import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const getPubDate = (date: string) => {
    const calendarDate = date.trim().split(' ', 1)[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(calendarDate) && !Number.isNaN(parseDate(calendarDate, 'YYYY-MM-DD', true).getTime()) ? parseDate(`${calendarDate}T00:00:00Z`) : undefined;
};

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/leemeng',
    name: 'blog',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    const url = 'https://leemeng.tw/blog.html';
    const response = await ofetch(url);
    const $ = load(response);
    const resultItem = $('article')
        .toArray()
        .map((elem) => {
            const $link = $(elem).find('[rel="bookmark"]');
            const title = $link.text();
            const link = new URL($link.attr('href')!, url).href;
            const summary = $(elem)
                .children('p')
                .toArray()
                .map((p) => $(p).text())
                .find(Boolean);
            const image = $(elem).find('img').attr('src');

            return {
                title,
                link,
                description: image ? `<img src="${image}"><p>${summary}</p>` : summary,
                image,
                category: $(elem)
                    .find('[rel="tag"]')
                    .toArray()
                    .map((tag) => $(tag).text()),
                // hero article uses .page-header__date, list articles use .blog-date
                pubDate: getPubDate($(elem).find('.blog-date a, .page-header__date').text()),
            };
        });

    return {
        title: 'LeeMeng - 部落格',
        link: url,
        item: resultItem,
    };
}
