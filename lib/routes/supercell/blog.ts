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
    handler,
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

async function handler(ctx) {
    const game = ctx.req.param('game');
    const locale = ctx.req.param('locale') || '';

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
                    if (pageProps?.bodyCollection?.items) {
                        content = pageProps.bodyCollection.items
                            .map((item) => {
                                if (item.__typename === 'ComponentText') {
                                    return item.text || '';
                                } else if (item.__typename === 'ComponentImage') {
                                    const imageUrl = item.image?.url || '';
                                    return imageUrl ? `<img src="${imageUrl}">` : '';
                                }
                                return '';
                            })
                            .join('');
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
