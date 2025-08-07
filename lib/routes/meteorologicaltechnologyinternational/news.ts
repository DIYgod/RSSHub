import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { puppeteerGet } from './utils';

export const route: Route = {
    path: '/news/:page?',
    name: 'News',
    url: 'meteorologicaltechnologyinternational.com/news',
    maintainers: ['tssujt'],
    example: '/meteorologicaltechnologyinternational/news',
    parameters: {
        page: 'Page number, default to 1',
    },
    description: 'Latest news and insights from Meteorological Technology International',
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['meteorologicaltechnologyinternational.com/news'],
            target: '/meteorologicaltechnologyinternational/news',
        },
    ],
    handler,
};

async function handler(ctx) {
    const page = ctx.req.param('page') || '1';
    const baseUrl = 'https://www.meteorologicaltechnologyinternational.com';
    let url = `${baseUrl}/news`;
    if (page !== '1') {
        url = `${url}/page/${page}`;
    }

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(url, cache);

    const $ = load(html);

    // Extract news articles from the "Browsing: News" section only
    const articles = $('.main-content .block-wrap.block-grid article.l-post.grid-post.grid-base-post')
        .toArray()
        .map((article) => {
            const $article = $(article);

            // Get title and link
            const $titleLink = $article.find('.post-title a').first();
            const title = $titleLink.text().trim();
            const link = $titleLink.attr('href');

            // Skip if no title or link
            if (!title || !link) {
                return null;
            }

            // Skip magazine issues
            if (link.includes('/online-magazines/')) {
                return null;
            }

            // Get date
            const dateStr = $article.find('time.post-date').attr('datetime');
            const pubDate = dateStr ? parseDate(dateStr) : undefined;

            // Get author
            const author = $article.find('a[rel="author"]').text().trim();

            // Get description/excerpt
            const description = $article.find('.excerpt').text().trim() || $article.find('.excerpt p').text().trim();

            // Get image
            const imageSpan = $article.find('.media span[data-bgsrc]').first();
            const image = imageSpan.attr('data-bgsrc');

            return {
                title,
                link: link.startsWith('http') ? link : new URL(link, baseUrl).href,
                pubDate,
                author,
                description,
                enclosure_url: image,
                enclosure_type: image ? 'image/jpeg' : undefined,
            };
        });

    return {
        title: 'Meteorological Technology International - News',
        link: url,
        description: 'Latest news and insights from the meteorological and weather technology industry',
        item: articles,
        allowEmpty: true,
    };
}
