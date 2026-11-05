import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage, type Page } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';

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

function parseCalendarDate(value: string) {
    const date = value.trim() ? parseDate(value.trim(), 'D MMMM YYYY', true) : undefined;
    return date && Number.isFinite(date.getTime()) ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) : undefined;
}

async function getItem(item: DataItem, page: Page) {
    const detail = await cache.tryGet(`ifs:article-detail:${item.link}`, async () => {
        await page.goto(item.link!, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('main .c-single-header');
        const response = await page.content();
        const $ = load(response);
        const content = $('main .c-text-block__container.js-wysiwyg');
        content.find('script, style, button').remove();
        const description = content
            .toArray()
            .map((element) => $(element).html())
            .join('');
        const author = $('.c-single-header a[href^="/people/"]')
            .toArray()
            .map((element) => $(element).text())
            .join(', ');
        const category = $('.c-single-header .o-tag')
            .toArray()
            .map((element) => $(element).text());
        const detail: Pick<DataItem, 'description' | 'author' | 'category' | 'enclosure_url' | 'enclosure_type'> = { description, author, category };
        const pdf = $('main .c-download-block a[href$=".pdf"]').first().attr('href');
        if (pdf) {
            detail.enclosure_url = new URL(pdf, baseUrl).href;
            detail.enclosure_type = 'application/pdf';
        }
        return detail;
    });
    return { ...item, ...detail };
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
        const limit = getRouteLimit(ctx, 20);
        const items = $('main article.c-card')
            .toArray()
            .slice(0, limit)
            .map((element): DataItem => {
                const card = $(element);
                const title = card.find('.c-card__title-link');
                const date = card.find('.c-card__date').text();
                return {
                    title: title.text(),
                    link: new URL(title.attr('href')!, baseUrl).href,
                    pubDate: parseCalendarDate(date),
                };
            });
        return { title: `IFS - ${$('main h1').first().text()}`, link, language: 'en' as const, item: await pMap(items, (item) => getItem(item, page), { concurrency: 1 }) };
    } finally {
        await destroy();
    }
}
