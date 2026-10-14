import { escapeAttribute } from 'entities';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:game/blog/:locale?',
    categories: ['game'],
    example: '/supercell/clashroyale/blog/zh',
    parameters: {
        game: 'Game name, see below',
        locale: 'Language code, see below, English by default',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['supercell.com/en/games/:game/:locale/blog', 'supercell.com/en/games/:game/blog'],
            target: '/:game/blog/:locale?',
        },
    ],
    name: 'Game Blog',
    maintainers: ['fishyo'],
    handler,
    description: `Supported games

| Game           | Slug         |
| -------------- | ------------ |
| Clash Royale   | clashroyale  |
| Brawl Stars    | brawlstars   |
| Clash of Clans | clashofclans |
| Boom Beach     | boombeach    |
| Hay Day        | hayday       |

Language codes

| Language  | Code    |
| --------- | ------- |
| English   |         |
| 繁體中文  | zh      |
| 简体中文  | zh-hans |
| Français  | fr      |
| Deutsch   | de      |
| Indonesia | id      |
| Italiano  | it      |
| 日本語    | ja      |
| 한국어    | ko      |
| Português | pt      |
| Русский   | ru      |
| Español   | es      |`,
};

interface Article {
    linkUrl: string;
    title: string;
    publishDate: string;
    category: string;
    descriptionForNewsArchive?: string;
}

const GAME_NAMES = {
    clashroyale: 'Clash Royale',
    brawlstars: 'Brawl Stars',
    clashofclans: 'Clash of Clans',
    boombeach: 'Boom Beach',
    hayday: 'Hay Day',
};

// Render the rich text JSON structure.
function renderRichText(json: any): string {
    if (!json?.content || !Array.isArray(json.content)) {
        return '';
    }

    return json.content
        .map((node) => {
            switch (node.nodeType) {
                case 'paragraph':
                    return `<p>${renderNodeContent(node)}</p>`;
                case 'heading-1':
                case 'heading-2':
                case 'heading-3':
                case 'heading-4':
                case 'heading-5':
                case 'heading-6': {
                    const level: string = node.nodeType.split('-', 2)[1];
                    return `<h${level}>${renderNodeContent(node)}</h${level}>`;
                }
                case 'quote':
                    return `<blockquote>${renderNodeContent(node)}</blockquote>`;
                case 'unordered-list':
                case 'ordered-list':
                    return `<${node.nodeType === 'unordered-list' ? 'ul' : 'ol'}>${node.content?.map((item) => `<li>${renderNodeContent(item)}</li>`).join('') || ''}</${node.nodeType === 'unordered-list' ? 'ul' : 'ol'}>`;
                case 'list-item':
                    return renderNodeContent(node);
                case 'table':
                    return `<table>${renderNodeContent(node)}</table>`;
                case 'hr':
                    return '<hr>';
                default:
                    return renderNodeContent(node);
            }
        })
        .join('');
}

// Render nested text nodes and formatting marks.
function renderNodeContent(node: any): string {
    if (!node?.content) {
        return '';
    }

    return node.content
        .map((item: any) => {
            if (item.nodeType === 'text') {
                let text = item.value || '';
                // Apply text formatting marks.
                if (item.marks && Array.isArray(item.marks)) {
                    for (const mark of item.marks) {
                        switch (mark.type) {
                            case 'bold':
                                text = `<strong>${text}</strong>`;
                                break;
                            case 'italic':
                                text = `<em>${text}</em>`;
                                break;
                            case 'underline':
                                text = `<u>${text}</u>`;
                                break;
                            case 'code':
                                text = `<code>${text}</code>`;
                                break;
                            default:
                                break;
                        }
                    }
                }
                return text;
            }
            // Render nested block nodes recursively.
            if (item.nodeType === 'paragraph' || item.nodeType === 'list-item') {
                return renderNodeContent(item);
            }
            if (item.nodeType === 'table-row') {
                return `<tr>${renderNodeContent(item)}</tr>`;
            }
            if (item.nodeType === 'table-cell' || item.nodeType === 'table-header-cell') {
                const tag = item.nodeType === 'table-header-cell' ? 'th' : 'td';
                return `<${tag}>${renderNodeContent(item)}</${tag}>`;
            }
            if (item.nodeType === 'hyperlink') {
                return `<a href="${escapeAttribute(new URL(item.data.uri, 'https://supercell.com').href)}">${renderNodeContent(item)}</a>`;
            }
            return '';
        })
        .join('');
}

// Render an article content block.
function renderBlock(block: any): string {
    const parts: string[] = [];

    switch (block.__typename) {
        case 'TextBlock':
            if (block.title) {
                parts.push(`<h3>${block.title}</h3>`);
            }
            if (block.text?.json?.content) {
                parts.push(renderRichText(block.text.json));
            }
            break;
        case 'FeatureBlock':
            if (block.title) {
                parts.push(`<h3>${block.title}</h3>`);
            }
            if (block.featureThumbnail?.url) {
                parts.push(`<img src="${block.featureThumbnail.url}" alt="${block.featureThumbnail.title || ''}">`);
            }
            if (block.featureText?.json?.content) {
                parts.push(renderRichText(block.featureText.json));
            }
            break;
        case 'ImageBlock': {
            const imageUrl = block.image?.url || block.url || '';
            if (imageUrl) {
                parts.push(`<img src="${imageUrl}" alt="${block.image?.title || block.title || ''}">`);
            }
            break;
        }
        case 'CarouselBlock':
            if (block.items && Array.isArray(block.items)) {
                for (const item of block.items) {
                    if (item.image?.url) {
                        parts.push(`<img src="${item.image.url}" alt="${item.image.title || ''}">`);
                    }
                }
            }
            break;
        default:
            break;
    }

    return parts.join('');
}

async function handler(ctx: Context) {
    const { game, locale = '' } = ctx.req.param();

    if (!Object.hasOwn(GAME_NAMES, game)) {
        throw new Error(`Unsupported game: ${game}. Supported games: ${Object.keys(GAME_NAMES).join(', ')}`);
    }

    const localePrefix = locale ? `/${locale}` : '';
    const rootUrl = 'https://supercell.com';
    const currentUrl = `${rootUrl}/en/games/${game}${localePrefix}/blog/`;

    const { data: response } = await got(currentUrl);
    // Extract the current Next.js build data from the page.
    const match = response.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    const nextData = match ? JSON.parse(match[1]) : {};
    const articles: Article[] = nextData.props.pageProps.articles || [];
    const buildId = nextData.buildId;

    const items = await pMap(
        articles,
        async (article) => {
            const link = `${rootUrl}${article.linkUrl}`;
            const pubDate = parseDate(article.publishDate);

            const resolvedValue1 = await recoverArticle(
                cache.tryGet(`supercell:article:v2:${link}`, async () => {
                    const dataUrl = `${rootUrl}/_next/data/${buildId}${article.linkUrl}.json`;
                    const { data: articleData } = await got(dataUrl);
                    const pageProps = articleData.pageProps;
                    let content = '';
                    if (pageProps?.bodyCollection && Array.isArray(pageProps.bodyCollection)) {
                        content = pageProps.bodyCollection.map((block: any) => renderBlock(block)).join('');
                    }
                    if (!content) {
                        throw new Error(`Article content was not found: ${link}`);
                    }
                    return { description: content };
                }),
                article
            );
            {
                const detail = resolvedValue1;
                return {
                    title: article.title,
                    link,
                    pubDate,
                    category: article.category,
                    author: 'Supercell',
                    ...detail,
                };
            }
        },
        { concurrency: 3 }
    );

    return {
        title: `${GAME_NAMES[game]} Blog${locale ? ` (${locale})` : ''}`,
        link: currentUrl,
        item: items,
        language: (locale || 'en') as Language,
    };
}

async function recoverArticle<T>(promise: Promise<T>, article: { descriptionForNewsArchive?: string }) {
    try {
        return await promise;
    } catch {
        return { description: article.descriptionForNewsArchive || '' };
    }
}
