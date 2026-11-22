import { load } from 'cheerio';

import type { Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';
import { parseDate } from '@/utils/time';

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

const parseReleaseDate = (releaseDate: string) => parseDate(releaseDate, 'YYYY-MM-DD');

const isVolumeReleased = (releaseDate: string) => {
    const releaseDateToCheck = parseReleaseDate(releaseDate);
    const todayDate = Temporal.Now.zonedDateTimeISO('UTC').startOfDay().toInstant();

    return releaseDateToCheck !== undefined && Temporal.Instant.compare(releaseDateToCheck, todayDate) <= 0;
};

async function getPlanningHTML(url: string) {
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
    const list = $('table#planning tbody tr[data-planning-date]')
        .toArray()
        .filter((item) => isVolumeReleased($(item).attr('data-planning-date')!));
    const items = list.map((item) => {
        const $item = $(item);
        const releaseDate = $item.attr('data-planning-date')!;

        const a = $item.find('td.p_titre > a');
        const image = $item.find('a[data-preview-image]').attr('data-preview-image')!;

        return {
            title: a.text(),
            link: new URL(a.attr('href')!, host).href,
            pubDate: parseReleaseDate(releaseDate),
            image: new URL(image, host).href,
            category: $item.find('td.p_titre div.fl').text(),
        };
    });

    return {
        title: 'Nautiljon France Manga Releases',
        link: `${host}/planning/manga/`,
        item: items,
    };
}
