import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['other'],
    example: '/news/en',
    parameters: { lang: 'en or es.' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['atptour.com'],
        },
    ],
    name: 'News',
    maintainers: ['LM1207'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://www.atptour.com';
    const favIcon = `${baseUrl}/assets/atptour/assets/favicon.ico`;
    const { lang = 'en' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 15) : 15;

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    const link = `${baseUrl}/${lang}/-/tour/news/latest-filtered-results/0/${limit}`;
    logger.http(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    const $ = load(response);
    const data = JSON.parse($('pre').text());
    page.close();
    browser.close();

    return {
        title: lang === 'en' ? 'News' : 'Noticias',
        link: `${baseUrl}/${lang}/news/news-filter-results`,
        description: lang === 'en' ? "News from the official site of men's professional tennis." : 'Noticias del sitio oficial del tenis profesional masculino.',
        language: lang,
        icon: favIcon,
        logo: favIcon,
        author: 'ATP',
        item: data.content.map((item) => ({
            title: item.title,
            link: baseUrl + item.url,
            description: item.description,
            author: item.byline,
            category: item.category,
            pubDate: parseDate(item.authoredDate),
            image: baseUrl + item.image,
        })),
    };
}
