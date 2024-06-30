import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog-community',
    categories: ['programming'],
    example: '/huggingface/blog-community',
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
            source: ['huggingface.co/blog/community', 'huggingface.co/blog', 'huggingface.co/'],
        },
    ],
    name: 'Huggingface Community Blog',
    maintainers: ['xcrong'],
    handler,
    url: 'huggingface.co/blog/community',
};

async function handler() {
    const { body: response } = await got('https://huggingface.co/blog/community');
    const $ = load(response);

    const articles = $('article').toArray();

    const items = articles.map((item) => {
        const timeElement = $(item).find('time');
        const datetime = timeElement.attr('datetime');
        const title = $(item).find('h4').text();
        const link = `https://huggingface.co${$(item).find('a').attr('href')}`;
        const author = $(item).find('object').attr('title');

        let pubDate;
        if (datetime) {
            pubDate = parseDate(datetime);
        }

        return {
            title,
            link,
            pubDate,
            author,
        };
    });
    return {
        title: 'Huggingface Community Blog',
        link: 'https://huggingface.co/blog/community',
        item: items,
    };
}
