import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

import { apiSlug, bakeFilterSearchParams, bakeFiltersWithPair, bakeUrl, fetchData, getFilterParamsForUrl, parseFilterStr } from './util';

async function handler(ctx) {
    const { url = 'https://wordpress.org/news', filter } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    if (!config.feature.allow_user_supply_unsafe_domain) {
        throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
    }

    if (!/^(https?):\/\/[^\s#$./?].\S*$/i.test(url)) {
        throw new Error('Invalid URL');
    }

    const cdn = config.wordpress.cdnUrl;
    const rootUrl = url;

    const filters = parseFilterStr(filter);
    const filtersWithPair = await bakeFiltersWithPair(filters, rootUrl);

    const searchParams = bakeFilterSearchParams(filters, 'name', false);
    const apiSearchParams = bakeFilterSearchParams(filtersWithPair, 'id', true);

    apiSearchParams.append('_embed', 'true');
    apiSearchParams.append('per_page', String(limit));

    const apiUrl = bakeUrl(`${apiSlug}/posts`, rootUrl, apiSearchParams);
    const currentUrl = bakeUrl(getFilterParamsForUrl(filtersWithPair) ?? '', rootUrl, searchParams);

    try {
        const { data: response } = await got(apiUrl);

        const items = (Array.isArray(response) ? response : JSON.parse(response.match(/(\[.*])$/)[1])).slice(0, limit).map((item) => {
            const terminologies = item._embedded['wp:term'];
            const guid = item.guid?.rendered ?? item.guid;

            const $$ = load(item.content?.rendered ?? item.content);

            $$('img').each((_, el) => {
                el = $$(el);

                const src = el.prop('src');

                if (src.startsWith('/')) {
                    el.prop('src', `${cdn}${item.link}${src}`);
                } else if (src.startsWith('http:')) {
                    el.prop('src', `${cdn}${src}`);
                }
            });

            const description = $$.html();

            return {
                title: item.title?.rendered ?? item.title,
                description,
                pubDate: parseDate(item.date_gmt),
                link: item.link,
                category: [...new Set(terminologies.flat().map((c) => c.name))],
                author: item._embedded.author.map((a) => a.name).join('/'),
                guid,
                id: guid,
                content: {
                    html: description,
                    text: $$.text(),
                },
                updated: parseDate(item.modified_gmt),
            };
        });

        const data = await fetchData(currentUrl, rootUrl);

        return {
            ...data,
            item: items,
        };
    } catch {
        const feed = await parser.parseURL(`${rootUrl}/feed/`);

        const items = feed.items.map((item) => {
            const guid = item.guid;

            const $$ = load(item['content:encoded']);

            $$('img').each((_, el) => {
                el = $$(el);

                const src = el.prop('src');

                if (src.startsWith('/')) {
                    el.prop('src', `${cdn}${item.link}${src}`);
                } else if (src.startsWith('http:')) {
                    el.prop('src', `${cdn}${src}`);
                }
            });

            const description = $$.html();

            return {
                title: item.title,
                description,
                pubDate: parseDate(item.pubDate ?? ''),
                link: item.link,
                category: item.categories,
                author: item.creator,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: $$.text(),
                },
            };
        });

        return {
            title: feed.title,
            description: feed.description,
            link: feed.link,
            item: items,
            allowEmpty: true,
            image: feed.image?.url,
            language: feed.language,
        };
    }
}

export const route: Route = {
    path: '/:url?/:filter{.+}?',
    name: 'WordPress',
    url: 'wordpress.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast',
    parameters: { url: 'URL, <https://wordpress.org/news> by default', filter: 'Filter, see below' },
    description: `If you subscribe to [WordPress News](https://wordpress.org/news/)，where the URL is \`https://wordpress.org/news/\`, Encode the URL using \`encodeURIComponent()\` and then use it as the parameter. Therefore, the route will be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews).

::: tip
  If you wish to subscribe to specific categories or tags, you can fill in the "filter" parameter in the route. \`/category/Podcast\` to subscribe to the Podcast category. In this case, the route would be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast).

  You can also subscribe to multiple categories. \`/category/Podcast,Community\` to subscribe to both the Podcast and Community categories. In this case, the route would be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast,Community\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Podcast,Community).

  Categories and tags can be combined as well. \`/category/Releases/tag/tagging\` to subscribe to the Releases category and the tagging tag. In this case, the route would be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Releases/tag/tagging\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/category/Releases/tag/tagging).
  
  You can also search for keywords. \`/search/Blog\` to search for the keyword "Blog". In this case, the route would be [\`/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/search/Blog\`](https://rsshub.app/wordpress/https%3A%2F%2Fwordpress.org%2Fnews/search/Blog).
:::`,
    categories: ['blog'],

    features: {
        requireConfig: [
            {
                name: 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN',
                description: `This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`,
                optional: false,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
};
