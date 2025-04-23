import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { Route, DataItem } from '@/types';

const rootUrl = 'https://cline.bot';
const blogUrl = `${rootUrl}/blog`;

// Extract article information from DOM
function extractArticlesFromDOM($) {
    return $('article')
        .toArray()
        .map((article) => {
            const element = $(article);
            const title = element.find('h2').first().text().trim();
            const linkEl = element.find('a').first();
            const link = linkEl.attr('href');
            const fullLink = link ? (link.startsWith('http') ? link : `${rootUrl}${link.startsWith('/') ? link : `/${link}`}`) : '';

            const metaEl = element.find('.text-xs.text-slate-500');
            const author = metaEl.find('span').first().text().trim();
            const dateStr = metaEl.find('span').eq(2).text().trim();
            const pubDate = dateStr ? parseDate(dateStr) : undefined;

            const summary = element.find('.text-slate-600').text().trim();
            const imgSrc = element.find('img').attr('src') || '';

            return {
                title,
                link: fullLink,
                pubDate,
                author,
                description: `<img src="${imgSrc}" /><p>${summary}</p>`,
            };
        })
        .filter((item) => item.title && item.link);
}

async function handler() {
    // Get blog homepage
    const response = await got({
        method: 'get',
        url: blogUrl,
    });

    const $ = load(response.data);

    const articles: DataItem[] = extractArticlesFromDOM($);

    if (articles.length === 0) {
        throw new Error('No articles found.');
    }

    return {
        title: 'Cline Official Blog',
        link: blogUrl,
        item: articles,
        description: 'Cline Official Blog - AI Coding Assistant',
    };
}

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/cline/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Blog',
    maintainers: ['yeshan333'],
    description: 'Cline Official Blog articles',
    handler,
    url: 'cline.bot/blog',
};
