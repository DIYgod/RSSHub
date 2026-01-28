import { load } from 'cheerio';

import { config } from '@/config';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export async function getNotifByPage(url): Promise<Array<{ title: string; link: string; pubDate: Date }>> {
    const pageUrl: string = url;

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

export async function getArticle(item) {
    const articleUrl: string = item.link;

    if (articleUrl.includes('sem.tongji.edu.cn/semch')) {
        // console.log(articleUrl);

        try {
            const response = await got.get(articleUrl, {
                headers: {
                    'User-Agent': config.ua,
                },
            });

            const html = response.body;
            const $ = load(html);

            const articleContentElement = $('#page-wrap > div.maim_pages > div > div.leftmain_page > div');
            item.description = articleContentElement ? articleContentElement.html() : '';
        } catch {
            // console.error(error);
        }
    }

    return item;
}
