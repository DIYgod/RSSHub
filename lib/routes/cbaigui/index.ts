import { load } from 'cheerio';

import type { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderFigure } from './templates/figure';
import { apiSlug, GetFilterId, rootUrl } from './utils';

export const route: Route = {
    path: '*',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    let filterName;

    const currentUrl = new URL(getSubPath(ctx).replace(/^\/cbaigui/, ''), rootUrl).href;
    let apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}`, rootUrl).href;

    const filterMatches = getSubPath(ctx).match(/^\/post-(tag|category)\/(.*)$/);

    if (filterMatches) {
        filterName = decodeURI(filterMatches[2].split('/').pop());
        const filterType = filterMatches[1] === 'tag' ? 'tags' : 'categories';
        const filterId = await GetFilterId(filterType, filterName);

        if (filterId) {
            apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}&${filterType}=${filterId}`, rootUrl).href;
        }
    }

    const { data: response } = await got(apiUrl);

    const items = response.slice(0, limit).map((item) => {
        const terminologies = item._embedded['wp:term'];

        const content = load(item.content?.rendered ?? item.content);

        // To handle lazy-loaded images from external sites.

        content('figure').each(function () {
            const image = content(this).find('img');
            const src = image.prop('data-actualsrc') ?? image.prop('data-original');
            const width = image.prop('data-rawwidth');
            const height = image.prop('data-rawheight');

            content(this).replaceWith(
                renderFigure({
                    src,
                    width,
                    height,
                })
            );
        });

        // To remove watermarks on images.

        content('p img').each(function () {
            const image = content(this);
            const src = image.prop('src').split('!')[0];
            const width = image.prop('width');
            const height = image.prop('height');

            content(this).replaceWith(
                renderFigure({
                    src,
                    width,
                    height,
                })
            );
        });

        return {
            title: item.title?.rendered ?? item.title,
            link: item.link,
            description: content.html(),
            author: item._embedded.author.map((a) => a.name).join('/'),
            category: [...terminologies[0], ...terminologies[1]].map((c) => c.name),
            guid: item.guid?.rendered ?? item.guid,
            pubDate: parseDate(item.date_gmt),
            updated: parseDate(item.modified_gmt),
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const icon = $('link[rel="apple-touch-icon"]').first().prop('href');

    return {
        item: items,
        title: `纪妖${filterName ? ` - ${filterName}` : ''}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: $('meta[name="msapplication-TileImage"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('p.site-description').text(),
        author: $('p.site-title').text(),
    };
}
