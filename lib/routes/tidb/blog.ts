import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { escapeUTF8 } from 'entities';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface ContentNode {
    type?: string;
    text?: string;
    children?: ContentNode[];
    strong?: boolean;
    emphasis?: boolean;
    delete?: boolean;
    inlineCode?: boolean;
    url?: string;
    title?: string;
    alt?: string;
    size?: { width: number; height: number };
    depth?: number;
    lang?: string;
    ordered?: boolean;
    start?: number;
}

const parseImageNode = (node: ContentNode): string => {
    const titleAttr = node.title ? ` title="${escapeUTF8(node.title)}"` : '';
    const altAttr = node.alt ? ` alt="${escapeUTF8(node.alt)}"` : '';
    const styleAttr = node.size ? ` style="width:${node.size.width}px;height:${node.size.height}px;"` : '';
    return node.url ? `<img src="${escapeUTF8(node.url)}"${titleAttr}${altAttr}${styleAttr}>` : '';
};

const parseContentNode = (node: ContentNode): string => {
    if (node.text !== undefined) {
        let text = escapeUTF8(node.text);
        if (node.inlineCode) {
            text = `<code>${text}</code>`;
        }
        if (node.strong) {
            text = `<strong>${text}</strong>`;
        }
        if (node.emphasis) {
            text = `<em>${text}</em>`;
        }
        if (node.delete) {
            text = `<del>${text}</del>`;
        }
        return text;
    }
    const children = parseContentToHtml(node.children ?? []);
    switch (node.type) {
        case 'paragraph':
            return `<p>${children}</p>`;
        case 'image':
            return parseImageNode(node);
        case 'heading': {
            const depth = node.depth && node.depth >= 1 && node.depth <= 6 ? node.depth : 2;
            return `<h${depth}>${children}</h${depth}>`;
        }
        case 'code':
            return `<pre><code${node.lang ? ` class="language-${escapeUTF8(node.lang)}"` : ''}>${(node.children ?? []).map((child) => escapeUTF8(child.text ?? '')).join('')}</code></pre>`;
        case 'list': {
            const tag = node.ordered ? 'ol' : 'ul';
            const startAttr = node.ordered && node.start !== undefined && node.start !== 1 ? ` start="${node.start}"` : '';
            return `<${tag}${startAttr}>${children}</${tag}>`;
        }
        case 'listItem':
            return `<li>${children}</li>`;
        case 'blockquote':
            return `<blockquote>${children}</blockquote>`;
        case 'link':
            return node.url ? `<a href="${escapeUTF8(node.url)}"${node.title ? ` title="${escapeUTF8(node.title)}"` : ''}>${children}</a>` : children;
        case 'table': {
            const [header, ...rows] = node.children ?? [];
            return `<table><thead><tr>${(header?.children ?? []).map((cell) => `<th>${parseContentToHtml(cell.children ?? [])}</th>`).join('')}</tr></thead><tbody>${parseContentToHtml(rows)}</tbody></table>`;
        }
        case 'tableRow':
            return `<tr>${children}</tr>`;
        case 'tableCell':
            return `<td>${children}</td>`;
        case 'thematicBreak':
            return '<hr>';
        default:
            return children;
    }
};

const parseContentToHtml = (content: ContentNode[]): string => content.map((node) => parseContentNode(node)).join('');

async function getArticleDescription(link: string, slug: string): Promise<string | undefined> {
    const details = await cache.tryGet(link, async () => {
        const response = await ofetch(`https://tidb.net/blog/api/posts/${slug}/detail`, { query: { visit: true } });
        return { description: response.content ? parseContentToHtml(JSON.parse(response.content)) : undefined };
    });
    return details.description;
}

export const handler = async (ctx: Context): Promise<Data> => {
    const { category = 'latest' } = ctx.req.param();
    const requestedLimit = Number(ctx.req.query('limit') ?? '20');
    const limit = Number.isFinite(requestedLimit) && Math.floor(requestedLimit) > 0 ? Math.floor(requestedLimit) : 20;

    const baseUrl = 'https://tidb.net';
    const targetUrl: string = new URL(`blog${category === 'latest' ? '' : `/c/${category}`}`, baseUrl).href;
    const targetResponse = await ofetch(targetUrl);

    const buildId: string | undefined = targetResponse.match(/"buildId":"(.*?)"/)?.[1];

    if (!buildId) {
        throw new Error('Build ID not found.');
    }

    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'zh') as Language;

    const apiUrl: string = new URL(`_next/data/${buildId}/${language}/blog${category === 'latest' ? '' : `/c/${category}`}.json`, baseUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            latest: true,
        },
    });

    let items: DataItem[] = response.pageProps.blogs.content.slice(0, limit).map((item): DataItem => {
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
                text: description ? load(description).text() : undefined,
            },
            updated: updated ? parseDate(updated) : undefined,
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
            const description = (await getArticleDescription(item.link, String(item.guid))) ?? item.description;
            const guid = `tidb-blog-${item.guid}`;
            return { ...item, description, guid, id: guid, content: { html: description, text: description ? load(description).text() : undefined } };
        },
        { concurrency: 3 }
    );

    const title: string = $('title').text();

    return {
        title,
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
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
| [社区动态](https://tidb.net/blog/c/community-feeds)            | [community-feeds](https://rsshub.app/tidb/blog/c/community-feeds)                   |`,
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
            source: ['tidb.net/blog/c/:category'],
            target: '/blog/c/:category',
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
