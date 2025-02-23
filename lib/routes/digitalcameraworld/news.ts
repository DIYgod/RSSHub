import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
const host = 'https://www.digitalcameraworld.com';
export const route: Route = {
    path: '/news',
    categories: ['new-media', 'popular'],
    example: '/digitalcameraworld/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['digitalcameraworld.com/'],
        },
    ],
    name: 'News',
    maintainers: ['EthanWng97'],
    handler,
};

async function handler() {
    const rssUrl = `${host}/feeds.xml`;

    const response = await ofetch(rssUrl);

    const $ = load(response, {
        xmlMode: true,
    });

    const items = $('item')
        .toArray()
        .map((item) => {
            item = $(item);
            let description = item.find(String.raw`dc\:content`).text();
            description = $('<div>').html(description);
            description.find('.vanilla-image-block').removeAttr('style');
            description.find('.fancy-box').remove();

            return {
                title: item.find('title').text(),
                pubDate: parseDate(item.find('pubDate').text()),
                link: item.find('link').text(),
                description: description.html(),
            };
        });

    return {
        title: 'Digital Camera World',
        link: host,
        description: 'Camera news, reviews and features',
        item: items,
    };
}
