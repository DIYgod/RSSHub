import { load } from 'cheerio';
import { config } from '@/config';
import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.nautiljon.com';
export const route: Route = {
    path: '/releases/manga',
    categories: ['reading'],
    example: 'nautiljon/releases/manga',
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

async function handler() {
    const response = await ofetch(`${host}/planning/manga/`, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response);
    const items = $('table#planning tbody tr')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('td.p_titre').find('a.sim').first();
            const img = item.find('td:nth-child(2) a').first();

            return {
                title: a.text(),
                link: `${host}${a.attr('href')}`,
                pubDate: parseDate(item.find('td').first().text(), 'DD/MM/YYYY'),
                image: `${host}${img.attr('im')}`,
                category: item.find('td.p_titre div.fl').first().text(),
            };
        });

    return {
        title: 'Nautiljon France Manga Releases',
        link: `${host}/planning/manga/`,
        item: items,
    };
}
