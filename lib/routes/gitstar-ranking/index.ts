import path from 'node:path';

import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'repositories' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const baseUrl: string = 'https://gitstar-ranking.com';
    const targetUrl: string = new URL(category, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    const items: DataItem[] = $('a.list-group-item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const stargazersCount: number = Number($el.find('span.stargazers_count').text()?.trim());
            const title: string = $el.find('span.hidden-xs').text()?.trim();
            const image: string | undefined = $el.find('img.avatar_image_big').attr('src');
            const language: string | undefined = $el.find('div.repo-language').text()?.trim();
            const description: string | undefined = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                stargazersCount,
                language,
                description: $el.find('div.repo-description').text()?.trim(),
            });
            const linkUrl: string | undefined = $el.attr('href');
            const categories: string[] = language ? [language] : [];
            const guid: string = `gitstar-ranking-${title}-${stargazersCount}`;

            const processedItem: DataItem = {
                title: `${title} ⭐${stargazersCount}`,
                description,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                language,
            };

            return processedItem;
        });

    const title: string = $('title').text();

    return {
        title,
        description: title.split(/-/)[0],
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author: title.split(/-/).pop()?.trim(),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/:category?',
    name: 'Ranking',
    url: 'gitstar-ranking.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/gitstar-ranking/repositories',
    parameters: {
        category: {
            description: 'Category, Repositories by default',
            options: [
                {
                    label: 'Users',
                    value: 'users',
                },
                {
                    label: 'Organizations',
                    value: 'organizations',
                },
                {
                    label: 'Repositories',
                    value: 'repositories',
                },
            ],
        },
    },
    description: `::: tip
To subscribe to [Repositories](https://gitstar-ranking.com/repositories), where the source URL is \`https://gitstar-ranking.com/repositories\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/gitstar-ranking/repositories\`](https://rsshub.app/gitstar-ranking/repositories).
:::

| Category                                                   | ID                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| [Users](https://gitstar-ranking.com/users)                 | [users](https://rsshub.app/gitstar-ranking/users)                 |
| [Organizations](https://gitstar-ranking.com/organizations) | [organizations](https://rsshub.app/gitstar-ranking/organizations) |
| [Repositories](https://gitstar-ranking.com/repositories)   | [repositories](https://rsshub.app/gitstar-ranking/repositories)   |
`,
    categories: ['programming'],
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
            source: ['gitstar-ranking.com/:category'],
            target: '/:category',
        },
        {
            title: 'Users',
            source: ['gitstar-ranking.com/users'],
            target: '/users',
        },
        {
            title: 'Organizations',
            source: ['gitstar-ranking.com/organizations'],
            target: '/organizations',
        },
        {
            title: 'Repositories',
            source: ['gitstar-ranking.com/repositories'],
            target: '/repositories',
        },
    ],
    view: ViewType.Articles,
};
