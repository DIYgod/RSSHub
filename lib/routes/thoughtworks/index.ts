import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch'; // Shared request client
import { parseDate } from '@/utils/parse-date';

type SearchResult = {
    title: string;
    uri: string;
    excerpt: string;
    raw: {
        sysauthor?: string | string[];
        tw_published_date?: number;
        tw_topic?: string | string[];
    };
};

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/thoughtworks/blog',
    radar: [
        {
            source: ['www.thoughtworks.com/zh-cn/insights/blog'],
        },
    ],
    name: 'Inside Blog',
    maintainers: ['Hyvi'],
    handler,
};

const getArticleDescription = (link: string) =>
    cache.tryGet(link, async () => {
        const response = await ofetch(link);
        const $ = load(response);
        const content = $('main .authorAndDate + .container');
        if (!content.length) {
            throw new Error('Thoughtworks article content not found.');
        }
        return content.html();
    });

async function handler() {
    // Fetch the public blog search token from the site configuration.
    const tokenData = await ofetch('https://www.thoughtworks.com/rest/search/config', {
        headers: {
            'content-type': 'application/json',
            origin: 'https://www.thoughtworks.com',
        },
    });

    // 'Bearer ' + token
    const bearerToken = 'Bearer ' + tokenData.BLOG_SEARCH_TOKEN;

    const data = await ofetch<{ results: SearchResult[] }>('https://platform-eu.cloud.coveo.com/rest/search/v2?organizationId=thoughtworksproductionhcqoag0q', {
        method: 'POST',
        headers: {
            authorization: bearerToken,
            'content-type': 'application/json',
            origin: 'https://www.thoughtworks.com',
            referer: 'https://www.thoughtworks.com/',
        },
        body: {
            context: { countryLocale: 'zh-cn' },
            fieldsToInclude: ['author', 'language', 'objecttype', 'collection', 'source', 'tw_content_type', 'tw_topic', 'tw_published_date'],
            sortCriteria: '@tw_published_date descending',
            numberOfResults: 10,
            firstResult: 0,
        },
    });
    // Map the source search results to feed items.
    const items = await pMap(
        data.results,
        async (item) => ({
            // Article title
            title: item.title,
            // Article link
            link: item.uri,
            // Main article content
            description: await getArticleDescription(item.uri),
            // Publication date
            pubDate: item.raw.tw_published_date ? parseDate(item.raw.tw_published_date) : undefined,
            // Article authors when available
            author: Array.isArray(item.raw.sysauthor) ? item.raw.sysauthor.map((name) => ({ name })) : item.raw.sysauthor,
            // Article categories when available
            category: Array.isArray(item.raw.tw_topic) ? item.raw.tw_topic : item.raw.tw_topic ? [item.raw.tw_topic] : undefined,
        }),
        { concurrency: 3 }
    );

    return {
        // Feed title
        title: 'ThoughtWorks Blog',
        // Feed link
        link: 'https://www.thoughtworks.com/zh-cn/insights/blog',
        // Feed items
        item: items,
    };
}
