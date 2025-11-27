import { load } from 'cheerio';
import { CookieJar } from 'tough-cookie';

import type { Route } from '@/types';
import cache from '@/utils/cache';
// The content is generateed by undocumentated API of nature journals
// This router has **just** been tested in:
// nature:           Nature
// nbt:              Nature Biotechnology
// neuro:            Nature Neuroscience
// ng:               Nature Genetics
// ni:               Nature Immunology
// nmeth:            Nature Method
// nchem:            Nature Chemistry
// nmat:             Nature Materials
// natmachintell:    Nature Machine Intelligence
// ncb:              Nature Cell Biology
// nplants:          Nature Plants
// natastron:        Nature Astronomy
// nphys             Nature Physics
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { baseUrl, journalMap } from './utils';

export const route: Route = {
    path: '/cover',
    categories: ['journal'],
    example: '/nature/cover',
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
            source: ['nature.com/'],
        },
    ],
    name: 'Cover Story',
    maintainers: ['y9c', 'pseudoyu'],
    handler,
    url: 'nature.com/',
    description: `Subscribe to the cover images of the Nature journals, and get the latest publication updates in time.`,
};

async function handler() {
    const cookieJar = new CookieJar();

    await got('https://www.nature.com', { cookieJar });

    const journals = journalMap.items
        .filter((j) => j.id)
        .map((j) => ({
            ...j,
            link: `${baseUrl}/${j.title}/current-issue`,
        }));

    const out = await Promise.all(
        journals.map((journal) =>
            cache.tryGet(journal.link, async () => {
                const { id, name, link } = journal;

                const response = await got(link, { cookieJar });
                const $ = load(response.data);

                const ogUrl = $('meta[property="og:url"]').attr('content');
                const capturingRegex = /volumes\/(?<volume>\d+)\/issues\/(?<issue>\d+)/;
                const { volume, issue } = ogUrl?.match(capturingRegex)?.groups ?? {};

                const imageUrl = `https://media.springernature.com/full/springer-static/cover-hires/journal/${id}/${volume}/${issue}?as=webp`;
                const contents = `<div align="center"><img src="${imageUrl}" alt="Volume ${volume} Issue ${issue}"></div>`;

                const date = $('title').text().split(',')[1].trim();
                const issueDescription = $('div[data-test=issue-description]').html() ?? '';

                return {
                    title: `${name} | Volume ${volume} Issue ${issue}`,
                    description: contents + issueDescription,
                    link: response.url,
                    pubDate: parseDate(date, 'MMMM YYYY'),
                };
            })
        )
    );

    return {
        title: 'Nature Covers Story',
        description: 'Find out the cover story of some Nature journals.',
        link: baseUrl,
        item: out,
    };
}
