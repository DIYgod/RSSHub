import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

import { config } from '@/config';

export async function getNotifByPage(pageNumber: number) {
    const pageUrl: string = `https://sem.tongji.edu.cn/semch/category/frontpage/notice/page/${pageNumber}`;

    try {
        const response = await got.get(pageUrl, {
            headers: {
                'User-Agent': config.ua,
            },
        });

        const html = response.body;
        const $ = load(html);

        const notifListElements = $('#page-wrap > div.maim_pages > div > div.leftmain_page > div > ul > li');

        return notifListElements.toArray().map((Element) => {
            const aTagFirst = $(Element).find('a.bt');
            const aTagSecond = $(Element).find('a.time');

            const title = aTagFirst.attr('title');
            const href = aTagFirst.attr('href');
            const time = aTagSecond.text().trim();

            return {
                title,
                link: href,
                pubDate: parseDate(time, 'YYYY-MM-DD'),
            };
        });
    } catch {
        // console.error(error);
    }
    return [];
}

export async function getLastPageNumber() {
    try {
        const response = await got.get('https://sem.tongji.edu.cn/semch/category/frontpage/notice', {
            headers: {
                'User-Agent': config.ua,
            },
        });
        const html = response.body;
        const $ = load(html);

        const lastPageElement = $('#page-wrap > div.maim_pages > div > div.leftmain_page > div > div > a.extend');
        const lastPageUrl: string | undefined = lastPageElement.attr('href');

        // console.log(lastPageUrl);

        if (lastPageUrl) {
            const lastPageNumber = lastPageUrl.match(/page\/(\d+)/)?.[1];
            if (lastPageNumber) {
                // console.log(`Last page number: ${lastPageNumber}`);
                return Number.parseInt(lastPageNumber);
            } else {
                // console.error('Failed to extract last page number.');
            }
        }
    } catch {
        // console.error(error);
    }

    return -1;
}
