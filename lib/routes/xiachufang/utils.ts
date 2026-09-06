import type { CheerioAPI } from 'cheerio';

import ofetch from '@/utils/ofetch';

export const fetchPage = (url: string) =>
    ofetch(url, {
        headers: {
            Referer: url,
        },
    });

export const generateItems = ($: CheerioAPI, timeframe?: string) => {
    const selector = ['week', 'rising', 'monthhonor'].includes(timeframe ?? '') ? '.normal-recipe-list li' : '.ias-container .pure-u';

    return $(selector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('.name a');
            const title = $link.text();
            const link = `https://www.xiachufang.com${$link.attr('href')}`;
            const img = $item.find('.cover img').attr('data-src')!.replaceAll(/\?.+/g, '');
            let desc = $item.find('.ing').text();
            if (!desc) {
                desc = $item.find('.desc').text().replaceAll('\n', '<br>');
            }

            return {
                title,
                link,
                description: `
                <img src="${img}" /><br>
                <strong>${title}</strong><br>
                ${desc}
            `,
            };
        });
};
