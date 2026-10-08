import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';

const baseUrl = 'https://ifs.org.uk';
const sections = {
    reports: '/research-and-analysis/reports',
    'press-releases': '/research-and-analysis/press-releases',
    explainers: '/explainers',
};

export const route: Route = {
    path: '/research/:section?',
    example: '/ifs/research/reports',
    name: 'Research and analysis',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    features: { requirePuppeteer: true },
    parameters: { section: 'reports (default), press-releases or explainers.' },
    description: 'Includes the article content available on the website and a PDF attachment when provided. Some reports publish an executive summary online and the complete report as a PDF.',
    radar: [
        { source: ['ifs.org.uk/research-and-analysis/reports'], target: '/research/reports' },
        { source: ['ifs.org.uk/research-and-analysis/press-releases'], target: '/research/press-releases' },
        { source: ['ifs.org.uk/explainers'], target: '/research/explainers' },
    ],
    handler,
};

function getItem(item: DataItem, page: Page) {
    return cache.tryGet(item.link!, async () => {
        await page.goto(item.link!, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('main .c-single-header');
        const response = await page.content();
        const $ = load(response);
        const content = $('main .c-text-block__container.js-wysiwyg');
        content.find('script, style, button').remove();
        item.description = content
            .toArray()
            .map((element) => $(element).html())
            .join('');
        item.author = $('.c-single-header a[href^="/people/"]')
            .toArray()
            .map((element) => $(element).text())
            .join(', ');
        item.category = $('.c-single-header .o-tag')
            .toArray()
            .map((element) => $(element).text());
        const pdf = $('main .c-download-block a[href$=".pdf"]').first().attr('href');
        if (pdf) {
            item.enclosure_url = new URL(pdf, baseUrl).href;
            item.enclosure_type = 'application/pdf';
        }
        return item;
    });
}

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'reports';
    if (!Object.hasOwn(sections, section)) {
        throw new InvalidParameterError('Choose reports, press-releases or explainers.');
    }
    const link = `${baseUrl}${sections[section as keyof typeof sections]}`;
    const { page, destroy } = await getPlaywrightPage(link, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        },
    });
    try {
        await page.waitForSelector('main article .c-card__title-link');
        const response = await page.content();
        const $ = load(response);
        const requestedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
        const items = $('main article.c-card')
            .toArray()
            .slice(0, requestedLimit > 0 ? requestedLimit : 20)
            .map((element): DataItem => {
                const card = $(element);
                const title = card.find('.c-card__title-link');
                const date = card.find('.c-card__date').text();
                return {
                    title: title.text(),
                    link: new URL(title.attr('href')!, baseUrl).href,
                    pubDate: date ? parseDate(date, 'D MMMM YYYY') : undefined,
                };
            });
        return { title: `IFS - ${$('main h1').first().text()}`, link, language: 'en' as const, item: await pMap(items, (item) => getItem(item, page), { concurrency: 1 }) };
    } finally {
        await destroy();
    }
}
