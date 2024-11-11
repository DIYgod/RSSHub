import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

export async function getNotifList() {
    try {
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
            .map((articleElement) => {
                const titleElement = $(articleElement).find('li > div > div.news-text > h4 > a');
                const timeElement = $(articleElement).find('li > div > div.news-text > span');
                const imageElement = $(articleElement).find('li > div > div.news-img > a > img');

                const link = titleElement.attr('href');
                const title = titleElement.attr('title');
                const pubDate = timeElement.text().trim();

                return {
                    title,
                    link,
                    itunes_item_image: imageElement.attr('src'),
                    pubDate: parseDate(pubDate, 'YYYY-MM-DD'),
                };
            });
    } catch {
        // console.error(error);
    }

    return [];
}

export async function getArticle(item) {
    try {
        const response = await got.get(item.link, {
            headers: {
                'User-Agent': config.ua,
            },
        });
        const html = response.body;
        const $ = load(html);
        const articleContentElement = $('body > div > main > section > div > div > div.post-content-contaier > div');
        const content = articleContentElement.html();
        const modifiedContent = content?.replace(/\n/g, '<br>');

        item.description = modifiedContent;
        return item;
    } catch {
        // console.error(error);
    }

    return item;
}
