import type { Route } from '@/types';
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
            source: ['supercell.com/en/games/:game/:locale/blog'],
            target: '/:game/blog/:locale',
        },
    ],
    name: 'Game Blog',
    maintainers: ['fishyo'],
    handler: handler as any,
    description: `Supported games

| Game              | Slug          |
| ----------------- | ------------- |
| Clash Royale      | clashroyale   |
| Brawl Stars       | brawlstars    |
| Clash of Clans    | clashofclans  |
| Boom Beach        | boombeach     |
| Hay Day           | hayday        |

Language codes

| Language           | Code    |
| ------------------ | ------- |
| English            |         |
| 繁體中文           | zh      |
| 简体中文           | zh-hans |
| Français           | fr      |
| Deutsch            | de      |
| Indonesia          | id      |
| Italiano           | it      |
| 日本語             | ja      |
| 한국어             | ko      |
| Português          | pt      |
| Русский            | ru      |
| Español            | es      |`,
};

const GAME_NAMES = {
    clashroyale: 'Clash Royale',
    brawlstars: 'Brawl Stars',
    clashofclans: 'Clash of Clans',
    boombeach: 'Boom Beach',
    hayday: 'Hay Day',
};

// 解析富文本 JSON 格式
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
                    const level: string = node.nodeType.split('-')[1];
                    return `<h${level}>${renderNodeContent(node)}</h${level}>`;
                }
                case 'quote':
                    return `<blockquote>${renderNodeContent(node)}</blockquote>`;
                case 'unordered-list':
                case 'ordered-list':
                    return `<${node.nodeType === 'unordered-list' ? 'ul' : 'ol'}>${node.content?.map((item) => `<li>${renderNodeContent(item)}</li>`).join('') || ''}</${node.nodeType === 'unordered-list' ? 'ul' : 'ol'}>`;
                case 'list-item':
                    return renderNodeContent(node);
                default:
                    return renderNodeContent(node);
            }
        })
        .join('');
}

// 渲染节点内容（处理文本和标记）
function renderNodeContent(node: any): string {
    if (!node?.content) {
        return '';
    }

    return node.content
        .map((item: any) => {
            if (item.nodeType === 'text') {
                let text = item.value || '';
                // 应用标记（粗体、斜体等）
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
            // 递归处理嵌套节点
            if (item.nodeType === 'paragraph' || item.nodeType === 'list-item') {
                return renderNodeContent(item);
            }
            return '';
        })
        .join('');
}

// 渲染 block 内容
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

async function handler(ctx: any) {
    const game: string = ctx.req.param('game');
    const locale: string = ctx.req.param('locale') || '';

    if (!GAME_NAMES[game]) {
        throw new Error(`Unsupported game: ${game}. Supported games: ${Object.keys(GAME_NAMES).join(', ')}`);
    }

    const localePrefix = locale ? `/${locale}` : '';
    const rootUrl = 'https://supercell.com';
    const currentUrl = `${rootUrl}/en/games/${game}${localePrefix}/blog/`;

    const { data: response } = await got(currentUrl);
    // 用正则提取 __NEXT_DATA__ JSON
    const match = response.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    const nextData = match ? JSON.parse(match[1]) : {};
    const articles = nextData.props.pageProps.articles || [];
    const buildId = nextData.buildId;

    const items = await Promise.all(
        articles.map((article) => {
            const link = `${rootUrl}${article.linkUrl}`;
            const pubDate = parseDate(article.publishDate);

            return cache.tryGet(link, async () => {
                try {
                    // 直接从 Next.js 数据端点获取 JSON
                    const dataUrl = `${rootUrl}/_next/data/${buildId}${article.linkUrl}.json`;
                    const { data: articleData } = await got(dataUrl);
                    const pageProps = articleData.pageProps;

                    // 从 bodyCollection 渲染内容
                    let content = '';
                    if (pageProps?.bodyCollection && Array.isArray(pageProps.bodyCollection)) {
                        content = pageProps.bodyCollection.map((block: any) => renderBlock(block)).join('');
                    }

                    return {
                        title: article.title,
                        link,
                        description: content || article.descriptionForNewsArchive || '',
                        pubDate,
                        category: article.category,
                        author: 'Supercell',
                    };
                } catch {
                    // 如果获取详细内容失败,使用列表页的简介
                    return {
                        title: article.title,
                        link,
                        description: article.descriptionForNewsArchive || '',
                        pubDate,
                        category: article.category,
                        author: 'Supercell',
                    };
                }
            });
        })
    );

    return {
        title: `${GAME_NAMES[game]} Blog${locale ? ` (${locale})` : ''}`,
        link: currentUrl,
        item: items,
        language: locale || 'en',
    };
}
