import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const host = 'https://www.nautiljon.com';
export const route: Route = {
    path: '/releases/manga',
    categories: ['reading'],
    example: '/nautiljon/releases/manga',
    parameters: {},
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
            source: ['nautiljon.com/'],
        },
    ],
    name: 'France manga releases',
    maintainers: ['Fafnor'],
    handler,
    url: 'nautiljon.com',
};

const parseReleaseDate = (releaseDate: string) => parseDate(releaseDate, /^\d{4}-\d{2}-\d{2}$/.test(releaseDate) ? 'YYYY-MM-DD' : 'DD/MM/YYYY');

const isVolumeReleased = (releaseDate: string) => {
    const releaseDateToCheck = parseReleaseDate(releaseDate);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    return releaseDateToCheck <= todayDate;
};

async function getPlanningHTML(url: string) {
    try {
        return await ofetch(url, { headers: { 'User-Agent': config.trueUA } });
    } catch (error) {
        if (!(error instanceof FetchError) || error.response?.status !== 403) {
            throw error;
        }
    }

    const { page, destroy } = await getPlaywrightPage(url, {
        closeTimeout: 0,
        noGoto: true,
        javaScriptEnabled: false,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (request) => (['document'].includes(request.request().resourceType()) ? request.continue() : request.abort()));
        },
    });
    try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (!response || response.status() >= 400) {
            throw new Error(`The manga planning page returned HTTP ${response?.status() ?? 'no response'}. Please try again later.`);
        }
        await page.locator('table#planning td.p_titre').first().waitFor({ state: 'attached', timeout: 10000 });
        return await page.content();
    } finally {
        await destroy();
    }
}

async function handler() {
    const response = await getPlanningHTML(`${host}/planning/manga/`);

    const $ = load(response);
    const list = $('table#planning tbody tr')
        .toArray()
        .filter((item) => isVolumeReleased($(item).attr('data-planning-date') ?? $(item).find('td').first().text()));
    const items = list.map((item) => {
        const $item = $(item);
        const releaseDate = $item.attr('data-planning-date') ?? $item.find('td').first().text();

        const a = $item.find('td.p_titre').find('a.sim').first();
        const img = $item.find('a[data-preview-image], a[im]').first();
        const image = img.attr('data-preview-image') ?? img.attr('im') ?? $item.find('img').first().attr('src');

        return {
            title: a.text(),
            link: new URL(a.attr('href')!, host).href,
            pubDate: timezone(parseReleaseDate(releaseDate), 0),
            image: image ? new URL(image, host).href : undefined,
            category: $item.find('td.p_titre div.fl').first().text(),
        };
    });

    return {
        title: 'Nautiljon France Manga Releases',
        link: `${host}/planning/manga/`,
        item: items,
    };
}
