import got from '@/utils/got';
import { load } from 'cheerio';
import cache from '@/utils/cache';

const base = 'https://home.gamer.com.tw/';

export const ProcessFeed = async (url: string) => {
    const response = await got.get(url);
    const $ = load(response.data);

    const title = $('title').text();
    const list = $('.BH-lbox > .HOME-mainbox1').toArray();

    const parseContent = (htmlString) => {
        const $ = load(htmlString);
        const content = $('.MSG-list8C');

        const images = $('img');
        for (const image of images) {
            $(image).attr('src', $(image).attr('data-src'));
        }

        return {
            description: content.html(),
        };
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = load(item);
            const title = $('.HOME-mainbox1b > h1 > a');
            const link = base + title.attr('href');
            const author = $('.HOME-mainbox1b > .ST1 > a').text();
            const time = $('.HOME-mainbox1b > .ST1').text().split('│')[1];

            const cacheContent = await cache.get(link);
            if (cacheContent) {
                return JSON.parse(cacheContent);
            }

            const topic = {
                title: title.text().trim(),
                link,
                author,
                pubDate: new Date(time),
                description: '',
            };

            try {
                const detail_response = await got.get(link);
                const result = parseContent(detail_response.data);
                if (!result.description) {
                    result.description = '';
                }
                topic.description = result.description;
            } catch {
                return '';
            }
            cache.set(link, JSON.stringify(topic));
            return topic;
        })
    );

    return { title, items };
};
