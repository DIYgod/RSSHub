import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

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
    const $ = load(response);

    // 从 __NEXT_DATA__ 脚本中提取 JSON 数据
    const nextData = JSON.parse($('#__NEXT_DATA__').text());
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

                    // 尝试从不同的可能位置提取内容
                    let content = '';

                    // 从 contentHtml 或 content 字段提取
                    if (pageProps?.contentHtml) {
                        content = pageProps.contentHtml;
                    } else if (pageProps?.content) {
                        content = pageProps.content;
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
