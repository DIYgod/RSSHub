import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:path{.+}?',
    radar: [
        {
            source: ['rfi.fr/*path'],
            target: '/:path',
        },
    ],
    name: 'Generic News',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    url: 'rfi.fr',
    example: '/rfi',
    description: `::: tip

- To subscribe to [English News](https://www.rfi.fr/en/), which URL is \`https://www.rfi.fr/en\`, you can get the route as [\`/rfi/en\`](https://rsshub.app/rfi/en).
- To subscribe to [English Europe News](https://www.rfi.fr/en/europe/), which URL is \`https://www.rfi.fr/en/europe\`, you can get the route as [\`/rfi/en/europe\`](https://rsshub.app/rfi/en/europe).
- To subscribe to topic [Paris Olympics 2024](https://www.rfi.fr/en/tag/paris-olympics-2024/), which URL is \`https://www.rfi.fr/en/tag/paris-olympics-2024\`, you can get the route as [\`/rfi/en/tag/paris-olympics-2024\`](https://rsshub.app/rfi/en/tag/paris-olympics-2024).

:::

::: warning
This route does not support podcasts, please use the Offical RSS feed instead.
:::`,
};

async function handler(ctx) {
    const rootUrl = 'https://www.rfi.fr/';
    const path = ctx.req.param('path') ?? 'en';
    const currentUrl = `${rootUrl}${path.endsWith('/') ? path : `${path}/`}`;
    const response = await got(currentUrl);

    const $ = load(response.data);

    $('aside[data-org-type="aside-content--highlighted"], aside[data-org-type="aside-content--sponsors"]').remove();

    let items = $('.article__title a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, currentUrl).href,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`rfi:article:v1:${item.link}`, async () => {
                const article: Omit<DataItem, 'title' | 'link'> = {};
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                content('.m-interstitial, .m-em-quote svg, .o-self-promo').remove();

                const ldJson = JSON.parse(content('script[type="application/ld+json"]:contains("NewsArticle")').text());

                article.description = [content('.t-content__chapo').prop('outerHTML'), content('.t-content__main-media').prop('outerHTML'), content('.t-content__body').html()].filter(Boolean).join('');
                article.pubDate = ldJson.datePublished ? parseDate(ldJson.datePublished) : undefined;
                article.updated = ldJson.dateModified ? parseDate(ldJson.dateModified) : undefined;
                article.author = ldJson.author?.map((author) => author.name).join(', ');
                article.category = ldJson.keywords;

                if (ldJson.audio) {
                    article.itunes_item_image = ldJson.audio.thumbnailUrl;
                    // TODO: Use Temporal.Duration when https://tc39.es/proposal-temporal/ is GA
                    const durationMatch = ldJson.audio.duration?.match(/P0DT(\d+)H(\d+)M(\d+)S/);
                    if (durationMatch) {
                        let seconds = 0;
                        for (const part of durationMatch.slice(1)) {
                            seconds = seconds * 60 + Number.parseInt(part);
                        }
                        article.itunes_duration = seconds;
                    }
                    article.enclosure_url = ldJson.audio.contentUrl;
                    article.enclosure_type = 'audio/mpeg';
                }

                return article;
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: currentUrl,
        image: $('meta[property="og:image"]').attr('content'),
        icon: new URL($('link[rel="apple-touch-icon"]').attr('href')!, currentUrl).href,
        logo: new URL($('link[rel="apple-touch-icon"]').attr('href')!, currentUrl).href,
        item: items,
        language: $('html').attr('lang') as Language,
    };
}
