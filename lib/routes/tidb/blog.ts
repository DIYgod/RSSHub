import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const escapeHtml = (text: string): string => text?.replaceAll('&', '&amp;')?.replaceAll('<', '&lt;')?.replaceAll('>', '&gt;')?.replaceAll("'", '&quot;')?.replaceAll("'", '&#039;') ?? text;

const parseTextChildren = (children: any[]): string => children.map((child: any) => escapeHtml(child.text)).join('');

const parseImageNode = (node: any): string => {
    const titleAttr = node.title ? ` title="${escapeHtml(node.title)}"` : '';
    const altAttr = node.alt ? ` alt="${escapeHtml(node.alt)}"` : '';
    const styleAttr = node.size ? ` style="width:${node.size.width}px;height:${node.size.height}px;"` : '';
    return `<img src="${escapeHtml(node.url)}"${titleAttr}${altAttr}${styleAttr}>`;
};

const parseListItemNode = (listItem: any): string => `<li>${parseContentToHtml(listItem.children)}</li>`;

const parseListNode = (node: any): string => {
    const tag = node.ordered ? 'ol' : 'ul';
    const startAttr = node.ordered && node.start !== 1 ? ` start="${node.start}"` : '';
    const listItemsHtml = node.children.map((item: any) => parseListItemNode(item)).join('');
    return `<${tag}${startAttr}>${listItemsHtml}</${tag}>`;
};

const parseParagraphChildren = (children: any[]): string =>
    children
        .map((child: any) => {
            if (child.text !== undefined) {
                return escapeHtml(child.text);
            } else if (child.type === 'image') {
                return parseImageNode(child);
            }
            return '';
        })
        .join('');

const parseContentToHtml = (content: any[]): string =>
    content
        ?.map((node: any) => {
            switch (node.type) {
                case 'paragraph':
                    return `<p>${parseParagraphChildren(node.children)}</p>`;
                case 'image':
                    return parseImageNode(node);
                case 'heading':
                    return `<h${node.depth}>${parseTextChildren(node.children)}</h${node.depth ?? ''}>`;
                case 'code':
                    return `<pre><code${node.lang ? ` class="language-${node.lang}"` : ''}>${parseTextChildren(node.children)}</code></pre>`;
                case 'list':
                    return parseListNode(node);
                case 'blockquote':
                    return `<blockquote>${parseContentToHtml(node.children)}</blockquote>`;
                default:
                    return '';
            }
        })
        .join('') ?? '';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'latest' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl: string = 'https://tidb.net';
    const targetUrl: string = new URL(`blog${category === 'latest' ? '' : `/c/${category}`}`, baseUrl).href;
    const targetResponse = await ofetch(targetUrl);

    const buildId: string | undefined = targetResponse.match(/"buildId":"(.*?)"/)?.[1];

    if (!buildId) {
        throw new Error('Build ID not found.');
    }

    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'zh';

    const apiUrl: string = new URL(`_next/data/${buildId}/${language}/blog${category === 'latest' ? '' : `/c/${category}`}.json`, baseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            latest: true,
        },
    });

    let items: DataItem[] = [];

    items = response.pageProps.blogs.content.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const description: string | undefined = item.summary;
        const pubDate: number | string = item.publishedAt;
        const linkUrl: string | undefined = item.slug ? `blog/${item.slug}` : undefined;
        const categories: string[] = [...new Set([item.category?.name, ...(item.tags ?? []).map((c) => c.name)].filter(Boolean))];
        const authors: DataItem['author'] = item.author?.username
            ? [
                  {
                      name: item.author.username,
                      url: new URL(`u/${item.author.username}`, baseUrl).href,
                      avatar: item.author.avatarURL,
                  },
              ]
            : undefined;
        const guid: string = item.slug ?? '';
        const updated: number | string = item.lastModifiedAt ?? pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        return processedItem;
    });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailUrl: string = new URL(`blog/api/posts/${item.guid}/detail`, baseUrl).href;

                const detailResponse = await ofetch(detailUrl, {
                    query: {
                        visit: true,
                    },
                });

                const title: string = detailResponse.title;
                const description: string | undefined = detailResponse.content ? parseContentToHtml(JSON.parse(detailResponse.content)) : item.description;
                const pubDate: number | string = detailResponse.publishedAt;
                const linkUrl: string | undefined = `blog/${detailResponse.slug}`;
                const categories: string[] = [...new Set([detailResponse.category?.name, ...(detailResponse.tags ?? []).map((c) => c.name)].filter(Boolean))];
                const authors: DataItem['author'] = detailResponse.author?.username
                    ? [
                          {
                              name: detailResponse.author.username,
                              url: new URL(`u/${detailResponse.author.username}`, baseUrl).href,
                              avatar: detailResponse.author.avatarURL,
                          },
                      ]
                    : undefined;
                const guid: string = `tidb-blog-${detailResponse.slug}`;
                const updated: number | string = detailResponse.lastModifiedAt ?? pubDate;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDate ? parseDate(pubDate) : undefined,
                    link: new URL(linkUrl, baseUrl).href,
                    category: categories,
                    author: authors,
                    guid,
                    id: guid,
                    content: {
                        html: description,
                        text: description,
                    },
                    updated: updated ? parseDate(updated) : undefined,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: title.split(/\|/).pop()?.trim(),
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/blog/c/:category?',
    name: '专栏分类',
    url: 'tidb.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/tidb/blog/c/latest',
    parameters: {
        category: {
            description: '分类，默认为 `latest`，即全部文章，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '全部文章',
                    value: 'latest',
                },
                {
                    label: '管理与运维',
                    value: 'management-and-operation',
                },
                {
                    label: '实践案例',
                    value: 'practical-case',
                },
                {
                    label: '架构选型',
                    value: 'architecture-selection',
                },
                {
                    label: '原理解读',
                    value: 'principle-interpretation',
                },
                {
                    label: '应用开发',
                    value: 'application-development',
                },
                {
                    label: '社区动态',
                    value: 'community-feeds',
                },
            ],
        },
    },
    description: `::: tip
订阅 [管理与运维](https://tidb.net/blog/c/management-and-operation)，其源网址为 \`https://tidb.net/blog/c/management-and-operation\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/tidb/blog/c/management-and-operation\`](https://rsshub.app/tidb/blog/c/management-and-operation)。
:::

| 分类                                                           | ID                                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [全部文章](https://tidb.net/blog)                              | [latest](https://rsshub.app/tidb/blog)                                              |
| [管理与运维](https://tidb.net/blog/c/management-and-operation) | [management-and-operation](https://rsshub.app/tidb/blog/c/management-and-operation) |
| [实践案例](https://tidb.net/blog/c/practical-case)             | [practical-case](https://rsshub.app/tidb/blog/c/practical-case)                     |
| [架构选型](https://tidb.net/blog/c/architecture-selection)     | [architecture-selection](https://rsshub.app/tidb/blog/c/architecture-selection)     |
| [原理解读](https://tidb.net/blog/c/principle-interpretation)   | [principle-interpretation](https://rsshub.app/tidb/blog/c/principle-interpretation) |
| [应用开发](https://tidb.net/blog/c/application-development)    | [application-development](https://rsshub.app/tidb/blog/c/application-development)   |
| [社区动态](https://tidb.net/blog/c/community-feeds)            | [community-feeds](https://rsshub.app/tidb/blog/c/community-feeds)                   |

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
            source: ['tidb.net/blog', 'tidb.net/blog/c/:category'],
            target: (params) => {
                const category: string = params.category;

                return `/tidb/blog/c${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '全部文章',
            source: ['tidb.net/blog'],
            target: '/blog/c/latest',
        },
        {
            title: '管理与运维',
            source: ['tidb.net/blog/c/management-and-operation'],
            target: '/blog/c/management-and-operation',
        },
        {
            title: '实践案例',
            source: ['tidb.net/blog/c/practical-case'],
            target: '/blog/c/practical-case',
        },
        {
            title: '架构选型',
            source: ['tidb.net/blog/c/architecture-selection'],
            target: '/blog/c/architecture-selection',
        },
        {
            title: '原理解读',
            source: ['tidb.net/blog/c/principle-interpretation'],
            target: '/blog/c/principle-interpretation',
        },
        {
            title: '应用开发',
            source: ['tidb.net/blog/c/application-development'],
            target: '/blog/c/application-development',
        },
        {
            title: '社区动态',
            source: ['tidb.net/blog/c/community-feeds'],
            target: '/blog/c/community-feeds',
        },
    ],
    view: ViewType.Articles,
};
