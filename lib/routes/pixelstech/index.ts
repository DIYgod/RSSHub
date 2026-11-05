import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import pMap from 'p-map';

import { type Data, type DataItem, type Language, type Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

const parseFeedDate = (date: string) => parseDate(/^\d{4}-\d{2}-\d{2}$/.test(date.trim()) ? `${date.trim()}T00:00:00Z` : date);

export const handler = async (ctx: Context): Promise<Data> => {
    const { topic } = ctx.req.param();
    const limit = getRouteLimit(ctx, 10);

    const baseUrl = 'https://www.pixelstech.net';
    const targetUrl: string = new URL(`feed/${topic ?? ''}`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('div.feed-item')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('a.feed-item-link');

            const title: string = $aEl.text();
            const image: string | undefined = $el.attr('data-bg-image');
            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: $el.find('div.feed-item-description').text(),
            });
            const pubDateStr: string | undefined = $el.parent().find('h2.section-heading').text();
            const linkUrl: string | undefined = $aEl.attr('href');
            const guid: string = $el.attr('data-feed-id') ? `pixelstech-feed#${$el.attr('data-feed-id')}` : '';
            const upDatedStr: string | undefined = $el.find('.time').text() || pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseFeedDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                guid,
                id: guid,
                content: {
                    html: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseFeedDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = await pMap(
        items,
        async (item) => {
            if (!item.link) {
                return item;
            }

            const articlePromise = cache.tryGet(`pixelstech:article:v3:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!);
                const $$: CheerioAPI = load(detailResponse);

                $$('div.login-prompt').remove();

                return {
                    title: $$('h1').text(),
                    articleHtml: $$('article.content-article').html() ?? undefined,
                    link: $$('span.source-text a').attr('href'),
                };
            });
            try {
                const detail = await articlePromise;
                const description = (item.description ?? '') + renderDescription({ description: detail.articleHtml });
                return { ...item, title: detail.title, description, link: detail.link ?? item.link, content: { html: description } };
            } catch {
                return item;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[name="twitter:image"]').attr('content'),
        author: $('meta[name="author"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/feed/:topic?',
    name: 'Feed',
    url: 'www.pixelstech.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/pixelstech/feed/ai',
    parameters: {
        topic: {
            description: 'Topic, all by default',
            options: [
                {
                    label: 'All',
                    value: '',
                },
                {
                    label: 'AI',
                    value: 'ai',
                },
                {
                    label: 'Alibaba',
                    value: 'alibaba',
                },
                {
                    label: 'Apple',
                    value: 'apple',
                },
                {
                    label: 'Database',
                    value: 'database',
                },
                {
                    label: 'Go',
                    value: 'go',
                },
                {
                    label: 'Huawei',
                    value: 'huawei',
                },
                {
                    label: 'Java',
                    value: 'java',
                },
                {
                    label: 'JavaScript',
                    value: 'javascript',
                },
                {
                    label: 'Linux',
                    value: 'linux',
                },
                {
                    label: 'LLM',
                    value: 'llm',
                },
                {
                    label: 'Nvidia',
                    value: 'nvidia',
                },
                {
                    label: 'Python',
                    value: 'python',
                },
                {
                    label: 'Rust',
                    value: 'rust',
                },
                {
                    label: 'Tesla',
                    value: 'tesla',
                },
                {
                    label: 'Web',
                    value: 'web',
                },
                {
                    label: 'Web3',
                    value: 'web3',
                },
                {
                    label: 'Zig',
                    value: 'zig',
                },
            ],
        },
    },
    description: `::: tip
To subscribe to [AI](https://www.pixelstech.net/feed/ai), where the source URL is \`https://www.pixelstech.net/feed/ai\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/pixelstech/feed/ai\`](https://rsshub.app/pixelstech/feed/ai).
:::

<details>
  <summary>More topics</summary>

| Topic                                                    | ID                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| [AI](https://www.pixelstech.net/feed/ai)                 | [ai](https://rsshub.app/pixelstech/feed/ai)                 |
| [Alibaba](https://www.pixelstech.net/feed/alibaba)       | [alibaba](https://rsshub.app/pixelstech/feed/alibaba)       |
| [Apple](https://www.pixelstech.net/feed/apple)           | [apple](https://rsshub.app/pixelstech/feed/apple)           |
| [Database](https://www.pixelstech.net/feed/database)     | [database](https://rsshub.app/pixelstech/feed/database)     |
| [Go](https://www.pixelstech.net/feed/go)                 | [go](https://rsshub.app/pixelstech/feed/go)                 |
| [Huawei](https://www.pixelstech.net/feed/huawei)         | [huawei](https://rsshub.app/pixelstech/feed/huawei)         |
| [Java](https://www.pixelstech.net/feed/java)             | [java](https://rsshub.app/pixelstech/feed/java)             |
| [JavaScript](https://www.pixelstech.net/feed/javascript) | [javascript](https://rsshub.app/pixelstech/feed/javascript) |
| [Linux](https://www.pixelstech.net/feed/linux)           | [linux](https://rsshub.app/pixelstech/feed/linux)           |
| [LLM](https://www.pixelstech.net/feed/llm)               | [llm](https://rsshub.app/pixelstech/feed/llm)               |
| [Nvidia](https://www.pixelstech.net/feed/nvidia)         | [nvidia](https://rsshub.app/pixelstech/feed/nvidia)         |
| [Python](https://www.pixelstech.net/feed/python)         | [python](https://rsshub.app/pixelstech/feed/python)         |
| [Rust](https://www.pixelstech.net/feed/rust)             | [rust](https://rsshub.app/pixelstech/feed/rust)             |
| [Tesla](https://www.pixelstech.net/feed/tesla)           | [tesla](https://rsshub.app/pixelstech/feed/tesla)           |
| [Web](https://www.pixelstech.net/feed/web)               | [web](https://rsshub.app/pixelstech/feed/web)               |
| [Web3](https://www.pixelstech.net/feed/web3)             | [web3](https://rsshub.app/pixelstech/feed/web3)             |
| [Zig](https://www.pixelstech.net/feed/zig)               | [zig](https://rsshub.app/pixelstech/feed/zig)               |

</details>`,
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
            source: ['www.pixelstech.net/feed/:topic?'],
            target: '/feed/:topic',
        },
        {
            title: 'All',
            source: ['www.pixelstech.net/feed/'],
            target: '/feed',
        },
    ],
    view: ViewType.Articles,
};
