import { load } from 'cheerio';

import type { Route } from '@/types';
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
    maintainers: ['nczitzk'],
    handler,
    url: 'rfi.fr',
    example: '/rfi',
    description: `::: tip
-   To subscribe to [English News](https://www.rfi.fr/en/), which URL is \`https://www.rfi.fr/en\`, you can get the route as [\`/rfi/en\`](https://rsshub.app/rfi/en).
-   To subscribe to [English Europe News](https://www.rfi.fr/en/europe/), which URL is \`https://www.rfi.fr/en/europe\`, you can get the route as [\`/rfi/en/europe\`](https://rsshub.app/rfi/en/europe).
-   To subscribe to topic [Paris Olympics 2024](https://www.rfi.fr/en/tag/paris-olympics-2024/), which URL is \`https://www.rfi.fr/en/tag/paris-olympics-2024\`, you can get the route as [\`/rfi/en/tag/paris-olympics-2024\`](https://rsshub.app/rfi/en/tag/paris-olympics-2024).
:::

::: warning
This route does not support podcasts, please use the Offical RSS feed instead.
:::
`,
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
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.attr('href'), currentUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                content('.m-interstitial, .m-em-quote svg, .o-self-promo').remove();

                const ldJson = JSON.parse(content('script[type="application/ld+json"]').text() || '[]').find((x) => x['@type'] === 'NewsArticle');

                item.description = content('.t-content__chapo').prop('outerHTML') + content('.t-content__main-media').prop('outerHTML') + content('.t-content__body').html();
                item.pubDate = parseDate(ldJson?.datePublished);
                item.updated = parseDate(ldJson?.dateModified);
                item.author = ldJson?.author.map((author) => author.name).join(', ');
                item.category = ldJson?.keywords;

                if (ldJson?.audio) {
                    item.itunes_item_image = ldJson.audio.thumbnailUrl;
                    // TODO: Use Temporal.Duration when https://tc39.es/proposal-temporal/ is GA
                    item.itunes_duration = ldJson.audio.duration
                        .match(/P0DT(\d+)H(\d+)M(\d+)S/)
                        .slice(1)
                        .map((x) => Number.parseInt(x))
                        .reduce((a, b) => a * 60 + b);
                    item.enclosure_url = ldJson.audio.contentUrl;
                    item.enclosure_type = 'audio/mpeg';
                }

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: currentUrl,
        image: $('meta[property="og:image"]').attr('content'),
        icon: new URL($('link[rel="apple-touch-icon"]').attr('href'), currentUrl).href,
        logo: new URL($('link[rel="apple-touch-icon"]').attr('href'), currentUrl).href,
        item: items,
        language: $('html').attr('lang'),
    };
}
