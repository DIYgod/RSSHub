import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

const host = 'https://www.nautiljon.com';
export const route: Route = {
    path: '/releases/manga',
    categories: ['reading'],
    example: '/nautiljon/releases/manga',
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

async function handler() {
    const response = await ofetch(`${host}/planning/manga/`);

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
