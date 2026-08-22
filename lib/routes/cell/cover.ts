import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cover',
    categories: ['journal'],
    example: '/cell/cover',
    name: 'Cover Story',
    maintainers: ['y9c'],
    description: `Subscribe to the cover images of the Cell journals, and get the latest publication updates in time.

Including 'cell', 'cancer-cell', 'cell-chemical-biology', 'cell-host-microbe', 'cell-metabolism', 'cell-reports', 'cell-reports-physical-science', 'cell-stem-cell', 'cell-systems', 'chem', 'current-biology', 'developmental-cell', 'immunity', 'joule', 'matter', 'molecular-cell', 'neuron', 'one-earth' and 'structure'.`,
    handler,
};

async function handler() {
    const baseURL = 'https://www.cell.com';
    const journals = [
        'cell',
        'cancer-cell',
        'cell-chemical-biology',
        'cell-host-microbe',
        'cell-metabolism',
        'cell-reports',
        'cell-reports-physical-science',
        'cell-stem-cell',
        'cell-systems',
        'chem',
        'current-biology',
        'developmental-cell',
        'immunity',
        'joule',
        'matter',
        'molecular-cell',
        'neuron',
        'one-earth',
        'structure',
    ];
    const coverIssn = {
        joule: '2542-4351',
        matter: '2590-2385',
        'one-earth': '2590-3322',
    };

    const out = await Promise.all(
        journals.map((journal) =>
            cache.tryGet(`${baseURL}/${journal}/current.rss`, async () => {
                const feed = await ofetch(`${baseURL}/${journal}/current.rss`, { responseType: 'text' });
                const $ = load(feed, { xmlMode: true });
                const channel = $('channel');

                const volume = channel.find(String.raw`prism\:volume`).text();
                const number = channel.find(String.raw`prism\:number`).text();
                const issn = coverIssn[journal] ?? channel.find(String.raw`prism\:issn`).text();
                const address = `${baseURL}/${journal}/current`;
                const coverImg = `https://ars.els-cdn.com/content/image/X${issn.replaceAll('-', '')}.jpg`;
                const publicationName = channel.find(String.raw`prism\:publicationName`).text();

                return {
                    title: `${publicationName} | Volume ${volume}, Issue ${number}`,
                    author: '@y9c',
                    description: `<img src="${coverImg}" alt="${publicationName}">`,
                    link: address,
                    guid: `${address}#${volume}-${number}`,
                    pubDate: parseDate(
                        channel
                            .find(String.raw`prism\:publicationDate`)
                            .text()
                            .slice(0, 10)
                    ),
                };
            })
        )
    );

    return {
        title: 'Cell Covers Story',
        description: 'Find out the cover story of some Cell journals.',
        link: baseURL,
        item: out,
    };
}
