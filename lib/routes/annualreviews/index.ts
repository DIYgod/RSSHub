import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const getDoi = (identifier: string | undefined) => identifier?.match(/10\.\d{4,9}\/[^?&#\s]+/)?.[0];

const enrichItem = async (item: DataItem) => {
    if (!item.doi) {
        return item;
    }
    try {
        return await cache.tryGet(item.guid!, async () => {
            const { data } = await got(`https://api.crossref.org/works/${item.doi}`);
            if (typeof data.message?.abstract === 'string' && data.message.abstract) {
                item.description = data.message.abstract.replaceAll('jats:p>', 'p>');
            }
            return item;
        });
    } catch {
        // Keep the publisher's abstract without caching a failed enrichment request.
        return item;
    }
};

export const route: Route = {
    path: '/:id',
    categories: ['journal'],
    example: '/annualreviews/anchem',
    parameters: { id: 'Journal id, can be found in URL' },
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
            source: ['annualreviews.org/journal/:id', 'annualreviews.org/'],
        },
    ],
    name: 'Journal',
    maintainers: ['nczitzk'],
    handler,
    description: `The URL of the journal [Annual Review of Analytical Chemistry](https://www.annualreviews.org/journal/anchem) is \`https://www.annualreviews.org/journal/anchem\`, where \`anchem\` is the id of the journal, so the route for this journal is \`/annualreviews/anchem\`.

::: tip
More jounals can be found in [Browse Journals](https://www.annualreviews.org/action/showPublications).
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.annualreviews.org';
    const feedUrl = `${rootUrl}/r/${id}_rss`;
    const currentUrl = `${rootUrl}/toc/${id}/current`;

    const response = await got({
        method: 'get',
        url: feedUrl,
    });

    const feed = await parser.parseString(response.body);
    if (!feed.title) {
        throw new Error('Annual Reviews feed does not contain a title. Please check the publisher feed.');
    }
    const $ = load(response.body, { xml: true });
    const atomEntries = $('feed > entry').toArray();
    const items = await pMap(
        feed.items,
        (item, index) => {
            if (!item.title) {
                throw new Error('Annual Reviews article does not contain a title. Please check the publisher feed.');
            }
            const atomElement = atomEntries[index];
            const atomEntry = atomElement ? $(atomElement) : undefined;
            const doi = getDoi(item.link) ?? getDoi(item.guid) ?? getDoi(item.id);
            const date = atomEntry ? atomEntry.find('published').text() : (item.pubDate ?? item.isoDate);
            return enrichItem({
                doi,
                guid: doi ?? item.guid ?? item.id,
                title: item.title,
                link: item.link?.split('?', 1)[0],
                description: atomEntry ? atomEntry.find('content').text() : (item['content:encoded'] ?? item.content ?? item.contentSnippet),
                pubDate: date ? parseDate(date) : undefined,
                author: atomEntry
                    ? atomEntry
                          .find('author name')
                          .toArray()
                          .map((author) => $(author).text())
                          .join(', ')
                    : (item.creator ?? item.author),
            });
        },
        { concurrency: 6 }
    );

    return {
        title: feed.title.replace(/: Table of Contents/, ''),
        description: feed.description ?? ($('feed > subtitle').text() || undefined),
        link: feed.link?.split('?', 1)[0] ?? currentUrl,
        item: items,
        language: feed.language as Language,
    };
}
