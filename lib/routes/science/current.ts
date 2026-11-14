import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

import { baseUrl } from './utils';

export const route: Route = {
    path: '/current/:journal?',
    categories: ['journal'],
    example: '/science/current/science',
    parameters: { journal: 'Short name for a journal' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['science.org/journal/:journal', 'science.org/toc/:journal/current'],
            target: '/current/:journal',
        },
    ],
    name: 'Current Issue',
    maintainers: ['y9c', 'TonyRL'],
    handler,
    description: `|  Short name |    Full name of the journal    | Route                                                                          |
| :---------: | :----------------------------: | ------------------------------------------------------------------------------ |
|   science   |             Science            | [/science/current/science](https://rsshub.app/science/current/science)         |
|    sciadv   |        Science Advances        | [/science/current/sciadv](https://rsshub.app/science/current/sciadv)           |
|  sciimmunol |       Science Immunology       | [/science/current/sciimmunol](https://rsshub.app/science/current/sciimmunol)   |
| scirobotics |        Science Robotics        | [/science/current/scirobotics](https://rsshub.app/science/current/scirobotics) |
|  signaling  |        Science Signaling       | [/science/current/signaling](https://rsshub.app/science/current/signaling)     |
|     stm     | Science Translational Medicine | [/science/current/stm](https://rsshub.app/science/current/stm)                 |

- Using route (\`/science/current/\` + "short name for a journal") to get current issue of a journal from AAAS.
- Leaving it empty (\`/science/current\`) to get update from Science.
- Abstracts are included when available from Crossref.`,
};

const abstractBatchSize = 40;

async function fetchAbstracts(dois: string[]) {
    const batches: string[][] = [];
    for (let offset = 0; offset < dois.length; offset += abstractBatchSize) {
        batches.push(dois.slice(offset, offset + abstractBatchSize));
    }
    const results = await pMap(
        batches,
        async (batch) => {
            try {
                return await cache.tryGet(`science:abstracts:${batch.join(',')}`, async () => {
                    const data = await ofetch<{ message: { items: Array<{ DOI: string; abstract?: string }> } }>('https://api.crossref.org/works', {
                        query: { filter: batch.map((doi) => `doi:${doi}`).join(','), select: 'DOI,abstract', rows: batch.length },
                        timeout: 8000,
                        retry: 0,
                    });
                    return data.message.items;
                });
            } catch {
                return [];
            }
        },
        { concurrency: 2 }
    );
    return new Map(results.flat().map(({ DOI, abstract }) => [DOI.toLowerCase(), abstract]));
}

const renderAbstract = (abstract: string) => {
    const $ = load(abstract);
    $('script, style').remove();
    return (
        $('body')
            .find('*')
            .filter((_, element) => element.tagName === 'jats:p' || element.tagName === 'p')
            .toArray()
            .map((paragraph) => `<p>${$(paragraph).html()}</p>`)
            .join('') || $('body').html()
    );
};

async function handler(ctx) {
    const { journal = 'science' } = ctx.req.param();
    if (!/^[a-z]+$/.test(journal)) {
        throw new InvalidParameterError('Use the short name of a Science journal, for example science or sciadv.');
    }
    const feed = await parser.parseURL(`${baseUrl}/action/showFeed?type=etoc&feed=rss&jc=${journal}`);
    const items = feed.items.flatMap((item) => {
        if (!item.title || !item.link) {
            return [];
        }
        const link = new URL(item.link, baseUrl);
        const doi = link.pathname.match(/^\/doi\/(?:abs\/|full\/)?(10\.[^/]+\/.+)$/)?.[1];
        if (doi) {
            link.pathname = `/doi/${doi}`;
            link.searchParams.delete('af');
        }
        const date = item.isoDate ?? item.pubDate;
        return {
            title: item.title,
            link: link.href,
            doi,
            description: item['content:encoded'] ?? item.content ?? item.contentSnippet,
            pubDate: date ? parseDate(date) : undefined,
            author: item.creator ?? item.author,
            category: item.categories,
        };
    });
    const dois = [...new Set(items.flatMap((item) => (item.doi ? [item.doi.toLowerCase()] : [])))].sort();
    const abstracts = await fetchAbstracts(dois);
    return {
        title: feed.title ?? `${journal} | Current Issue`,
        description: feed.description,
        image: `${baseUrl}/apple-touch-icon.png`,
        link: feed.link ?? `${baseUrl}/toc/${journal}/current`,
        language: 'en-us' as const satisfies Language,
        item: items.map((item) => {
            const abstract = item.doi ? abstracts.get(item.doi.toLowerCase()) : undefined;
            return abstract ? { ...item, description: [item.description, renderAbstract(abstract)].filter(Boolean).join('<br>') } : item;
        }),
    };
}
