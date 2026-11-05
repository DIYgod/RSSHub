import { load } from 'cheerio';

import { config } from '@/config';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export async function getNotifByPage(url): Promise<Array<{ title: string; link: string; pubDate: Date }>> {
    const pageUrl: string = url;

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
        const time = aTagSecond.text();

        return {
            title: title!,
            link: href!,
            pubDate: timezone(parseDate(time, 'YYYY-MM-DD'), 8),
        };
    });
}

export async function getArticle(articleUrl: string) {
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

            const articleContentElement = $('.leftmain_news').first();
            articleContentElement.find('.leftmain_news_title, .leftmain_news_time').remove();
            return { description: articleContentElement.html() ?? undefined };
        } catch {
            // console.error(error);
        }
    }

    return {};
}
