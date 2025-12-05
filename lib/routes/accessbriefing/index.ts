import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx) => {
    const { category = 'latest/news' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.accessbriefing.com';
    const currentUrl = new URL(category, rootUrl).href;
    const apiUrl = new URL('Ajax/GetPagedArticles', rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const brandId = currentResponse.match(/'BrandID':\s(\d+)/)?.[1] ?? '32';
    const moreID = currentResponse.match(/'MoreID':\s(\d+)/)?.[1] ?? '9282';

    const { data: response } = await got(apiUrl, {
        searchParams: {
            navcontentid: moreID,
            brandid: brandId,
            page: 0,
            lastpage: 0,
            pagesize: limit,
        },
    });

    const $ = load(currentResponse);

    const language = $('html').prop('lang');

    let items = response.slice(0, limit).map((item) => {
        const title = item.Article_Headline;
        const image = new URL(item.Image, rootUrl).href;
        const description = art(path.join(__dirname, 'templates/description.art'), {
            images: image
                ? [
                      {
                          src: image,
                          alt: title,
                      },
                  ]
                : undefined,
            intro: item.Article_Intro_Plaintext,
        });
        const guid = `accessbriefing-${item.Article_ID}`;

        return {
            title,
            description,
            pubDate: parseDate(item.Article_PublishedDate),
            link: new URL(item.URL, rootUrl).href,
            author: item.Authors.join('/'),
            guid,
            id: guid,
            content: {
                html: description,
                text: item.Article_Intro_Plaintext,
            },
            image,
            banner: image,
            language,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.khl-article-page-title').text();
                const description =
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.khl-article-page-storybody').html(),
                    });

                item.title = title;
                item.description = description;
                item.category = $$('a.badge[data-id]')
                    .toArray()
                    .map((c) => $$(c).text());
                item.author = $$('div.authorDetails a span b').text();
                item.content = {
                    html: description,
                    text: $$('div.khl-article-page-storybody').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('a.navbar-brand img').prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: 'Articles',
    url: 'accessbriefing.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/accessbriefing/latest/news',
    parameters: { category: 'Category, Latest News by default' },
    description: `::: tip
  If you subscribe to [Latest News](https://www.accessbriefing.com/latest/news)，where the URL is \`https://www.accessbriefing.com/latest/news\`, extract the part \`https://www.accessbriefing.com/\` to the end, and use it as the parameter to fill in. Therefore, the route will be [\`/accessbriefing/latest/news\`](https://rsshub.app/accessbriefing/latest/news).
:::

#### Latest

| Category                                                                               | ID                                                                                              |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [News](https://www.accessbriefing.com/latest/news)                                     | [latest/news](https://rsshub.app/target/site/latest/news)                                       |
| [Products & Technology](https://www.accessbriefing.com/latest/products-and-technology) | [latest/products-and-technology](https://rsshub.app/target/site/latest/products-and-technology) |
| [Rental News](https://www.accessbriefing.com/latest/rental-news)                       | [latest/rental-news](https://rsshub.app/target/site/latest/rental-news)                         |
| [People](https://www.accessbriefing.com/latest/people)                                 | [latest/people](https://rsshub.app/target/site/latest/people)                                   |
| [Regualtions & Safety](https://www.accessbriefing.com/latest/regualtions-safety)       | [latest/regualtions-safety](https://rsshub.app/target/site/latest/regualtions-safety)           |
| [Finance](https://www.accessbriefing.com/latest/finance)                               | [latest/finance](https://rsshub.app/target/site/latest/finance)                                 |
| [Sustainability](https://www.accessbriefing.com/latest/sustainability)                 | [latest/sustainability](https://rsshub.app/target/site/latest/sustainability)                   |

#### Insight

| Category                                                                          | ID                                                                                        |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Interviews](https://www.accessbriefing.com/insight/interviews)                   | [insight/interviews](https://rsshub.app/target/site/insight/interviews)                   |
| [Longer reads](https://www.accessbriefing.com/insight/longer-reads)               | [insight/longer-reads](https://rsshub.app/target/site/insight/longer-reads)               |
| [Videos and podcasts](https://www.accessbriefing.com/insight/videos-and-podcasts) | [insight/videos-and-podcasts](https://rsshub.app/target/site/insight/videos-and-podcasts) |
  `,
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['accessbriefing.com/:category*'],
            target: '/:category',
        },
        {
            title: 'Latest - News',
            source: ['accessbriefing.com/latest/news'],
            target: '/latest/news',
        },
        {
            title: 'Latest - Products & Technology',
            source: ['accessbriefing.com/latest/products-and-technology'],
            target: '/latest/products-and-technology',
        },
        {
            title: 'Latest - Rental News',
            source: ['accessbriefing.com/latest/rental-news'],
            target: '/latest/rental-news',
        },
        {
            title: 'Latest - People',
            source: ['accessbriefing.com/latest/people'],
            target: '/latest/people',
        },
        {
            title: 'Latest - Regualtions & Safety',
            source: ['accessbriefing.com/latest/regualtions-safety'],
            target: '/latest/regualtions-safety',
        },
        {
            title: 'Latest - Finance',
            source: ['accessbriefing.com/latest/finance'],
            target: '/latest/finance',
        },
        {
            title: 'Latest - Sustainability',
            source: ['accessbriefing.com/latest/sustainability'],
            target: '/latest/sustainability',
        },
        {
            title: 'Insight - Interviews',
            source: ['accessbriefing.com/insight/interviews'],
            target: '/insight/interviews',
        },
        {
            title: 'Insight - Longer reads',
            source: ['accessbriefing.com/insight/longer-reads'],
            target: '/insight/longer-reads',
        },
        {
            title: 'Insight - Videos and podcasts',
            source: ['accessbriefing.com/insight/videos-and-podcasts'],
            target: '/insight/videos-and-podcasts',
        },
    ],
};
