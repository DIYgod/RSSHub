import { load } from 'cheerio';
import { escapeText } from 'entities';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/region/:region{.+}?',
    example: '/brookings/region/asia-the-pacific/china',
    parameters: { region: 'Region path after /regions/ in the website URL, defaults to asia-the-pacific/china' },
    categories: ['finance'],
    radar: [{ source: ['www.brookings.edu/regions/:region+'], target: '/region/:region' }],
    name: 'Regional research',
    maintainers: ['DIYgod'],
    handler,
    description: 'Includes the article excerpts supplied by the official regional research search index.',
};

async function handler(ctx) {
    const region = ctx.req.param('region') || 'asia-the-pacific/china';
    const link = `https://www.brookings.edu/regions/${region
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')}/`;
    const response = await ofetch(link);
    const $ = load(response);
    const scripts = $('script')
        .toArray()
        .map((element) => $(element).text())
        .join('\n');
    const configMatch = scripts.match(/(?:var|const) algolia = (\{[^\n]+\});/);
    const optionsMatch = scripts.match(/const brookingsAlgoliaFeedOptions = (\{[^\n]+\});/);
    if (!configMatch || !optionsMatch) {
        throw new Error('The regional page did not provide its public research index configuration.');
    }
    const config = JSON.parse(configMatch[1]);
    const options = JSON.parse(optionsMatch[1]);
    const result = await ofetch(`https://${config.application_id}-dsn.algolia.net/1/indexes/${encodeURIComponent(config.indices.searchable_posts.name)}/query`, {
        method: 'POST',
        headers: { 'x-algolia-application-id': config.application_id, 'x-algolia-api-key': config.search_api_key },
        body: { filters: JSON.parse(options.filter), hitsPerPage: 20, page: 0, distinct: 1 },
    });
    const seen = new Set<string>();
    const items = result.hits
        .filter((item) => {
            if (!item.permalink || seen.has(item.permalink)) {
                return false;
            }
            seen.add(item.permalink);
            return true;
        })
        .map((item) => ({
            title: item.post_title,
            link: item.permalink,
            author: item.display_authors?.join(', '),
            category: item.primary_topic,
            description: `<p>${escapeText(item.content || item.post_excerpt || '')}</p>`,
            pubDate: parseDate(item.post_date_formatted, 'MMMM D, YYYY'),
        }))
        .toSorted((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    return { title: $('title').text(), link, item: items.slice(0, Number(ctx.req.query('limit')) || 20) };
}
