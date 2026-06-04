import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { apiSlug, bakeFilterSearchParams, bakeFiltersWithPair, bakeUrl, fetchData, getFilterNameForTitle, getFilterParamsForUrl, parseFilterStr, rootUrl } from './util';

export const route: Route = {
    path: '/:filter{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const filter = ctx.req.param('filter');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const filters = parseFilterStr(filter);
    const filtersWithPair = await bakeFiltersWithPair(filters);

    const searchParams = bakeFilterSearchParams(filters, 'name', false);
    const apiSearchParams = bakeFilterSearchParams(filtersWithPair, 'id', true);

    apiSearchParams.append('_embed', 'true');
    apiSearchParams.append('per_page', limit);

    const apiUrl = bakeUrl(`${apiSlug}/posts`, rootUrl, apiSearchParams);
    const currentUrl = bakeUrl(getFilterParamsForUrl(filtersWithPair) ?? '', rootUrl, searchParams);

    const { data: response } = await got(apiUrl);

    const items = (Array.isArray(response) ? response : JSON.parse(response.match(/(\[.*])$/)[1])).slice(0, limit).map((item) => {
        const terminologies = item._embedded['wp:term'];

        const content = load(item.content?.rendered ?? item.content);

        content('div.mycred-sell-this-wrapper').prevUntil('hr').nextAll().remove();

        return {
            title: item.title?.rendered ?? item.title,
            link: item.link,
            description: content.html(),
            author: item._embedded.author.map((a) => a.name).join('/'),
            category: [...new Set(terminologies.flat().map((c) => c.name))],
            guid: item.guid?.rendered ?? item.guid,
            pubDate: parseDate(item.date_gmt),
            updated: parseDate(item.modified_gmt),
        };
    });

    const subtitle = getFilterNameForTitle(filtersWithPair);

    return {
        ...(await fetchData(currentUrl)),
        item: items,
        title: `Getitfree${subtitle ? ` | ${subtitle}` : ''}`,
    };
}
