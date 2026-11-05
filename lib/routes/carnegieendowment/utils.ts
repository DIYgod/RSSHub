import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const baseUrl = 'https://carnegieendowment.org';

const getSearchConfig = () =>
    cache.tryGet('carnegieendowment:search-config', async () => {
        const response = await ofetch(`${baseUrl}/regions/china`);
        const $ = load(response);
        const scripts = $('script[src^="/_next/static/"]')
            .toArray()
            .map((script) => new URL($(script).attr('src')!, baseUrl).href);
        const configurations = await pMap(
            scripts,
            async (url) => {
                const script = await ofetch(url, { responseType: 'text' });
                const key = script.match(/NEXT_PUBLIC_TYPESENSE_API_KEY:"([^"]+)"/)?.[1];
                const host = script.match(/NEXT_PUBLIC_TYPESENSE_HOST:"([^"]+)"/)?.[1];
                return key && host ? { key, host } : undefined;
            },
            { concurrency: 3 }
        );
        const configuration = configurations.find(Boolean);
        if (!configuration) {
            throw new Error('Unable to find Carnegie’s public search configuration.');
        }
        return configuration;
    });

function getItem(item: DataItem) {
    if (!item.link?.startsWith(`${baseUrl}/`)) {
        return item;
    }
    return cache.tryGet(item.link!, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);
        const content = $('.white-scheme > .cms-html.payload-richtext');
        content.find('script, style').remove();
        item.description =
            content
                .toArray()
                .map((element) => $(element).html())
                .join('') || item.description;
        return item;
    });
}

export async function getResearch(filter: string, limit: number) {
    const configuration = await getSearchConfig();
    const response = await ofetch(`https://${configuration.host}/multi_search`, {
        method: 'POST',
        headers: { 'x-typesense-api-key': configuration.key },
        body: { searches: [{ collection: 'content_en', q: '*', query_by: '*', sort_by: 'contentSummary.publishedAt:desc', filter_by: filter, page: 1, per_page: 25 }] },
    });
    if (response.results[0].error) {
        throw new Error(response.results[0].error);
    }
    const items: DataItem[] = response.results[0].hits.slice(0, limit).map(({ document }) => ({
        title: document.contentSummary.title,
        link: new URL(document.contentSummary.href, baseUrl).href,
        pubDate: parseDate(document.contentSummary.publishedAt, 'x'),
        author: document.contributors.map((author) => author.title).join(', '),
        category: document.topics.map((topic) => topic.title),
        description: document.contentSummary.descriptionRichText,
    }));
    return pMap(items, getItem, { concurrency: 3 });
}
