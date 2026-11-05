import { load } from 'cheerio';

import { config } from '@/config';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export async function getNotifList() {
    const response = await got.get('https://scupi.scu.edu.cn/activities/notice', {
        headers: {
            'User-Agent': config.ua,
        },
    });
    const html = response.body;
    const $ = load(html);

    const listElement = $('body > div.wrapper > main > section > div > div > div.news > div > ul');
    return listElement
        .find('article')
        .toArray()
        .flatMap((articleElement) => {
            const titleElement = $(articleElement).find('.news-text h4 a');
            const timeElement = $(articleElement).find('.news-text span');
            const imageElement = $(articleElement).find('.news-img img');

            const link = titleElement.attr('href');
            const title = titleElement.attr('title') ?? titleElement.text();
            if (!link || !title) {
                return [];
            }
            const pubDate = timeElement.text().trim();

            return {
                title,
                link,
                itunes_item_image: imageElement.attr('src'),
                pubDate: parseDateInTimezone(pubDate, 8),
            };
        });
}

export async function getArticle(link: string) {
    try {
        const response = await got.get(link, {
            headers: {
                'User-Agent': config.ua,
            },
        });
        const html = response.body;
        const $ = load(html);
        const articleContentElement = $('.post-content article').first();
        const content = articleContentElement.html();

        return { description: content };
    } catch {
        // console.error(error);
    }

    return {};
}
