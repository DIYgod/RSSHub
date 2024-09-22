import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: 'search/:keyword',
    name: 'Search',
    url: 'anime1.me',
    maintainers: ['cxheng315'],
    example: '/anime1/search/神之塔',
    categories: ['anime'],
    parameters: {
        keyword: 'Anime1 Search Keyword',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};

async function handler(ctx) {
    const { keyword } = ctx.req.param();

    const response = await ofetch(`https://anime1.me/?s=${keyword}`);

    const $ = load(response);

    const title = $('page-title').text().trim();

    const items = $('article.type-post')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('.entry-title a').text().trim();
            return {
                title,
                link: $el.find('.entry-title a').attr('href'),
                description: title,
                pubDate: parseDate($el.find('time').attr('datetime') || ''),
            };
        });

    return {
        title,
        link: `https://anime1.me/?s=${keyword}`,
        description: title,
        itunes_author: 'Anime1',
        itunes_image: 'https://anime1.me/wp-content/uploads/2021/02/cropped-1-180x180.png',
        item: items,
    };
}
