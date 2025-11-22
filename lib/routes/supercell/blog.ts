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
    maintainers: [],
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

    const items = await Promise.all(
        articles.map((article) => {
            const link = `${rootUrl}${article.linkUrl}`;
            const pubDate = parseDate(article.publishDate);

            return cache.tryGet(link, async () => {
                try {
                    const { data: articleResponse } = await got(link);
                    const $$ = load(articleResponse);

                    // 从文章页面的 __NEXT_DATA__ 中提取完整内容
                    const articleNextData = JSON.parse($$('#__NEXT_DATA__').text());
                    const pageProps = articleNextData.props?.pageProps;

                    // 尝试从不同的可能位置提取内容
                    let content = '';

                    // 从 contentHtml 或 content 字段提取
                    if (pageProps?.contentHtml) {
                        content = pageProps.contentHtml;
                    } else if (pageProps?.content) {
                        content = pageProps.content;
                    } else {
                        // 如果找不到,尝试从页面本身提取主要内容
                        const mainContent = $$('main').html() || $$('article').html() || '';
                        content = mainContent;
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
