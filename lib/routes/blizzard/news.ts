import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/news/:language?/:category?',
    categories: ['game'],
    example: '/blizzard/news',
    parameters: { language: 'Language code, see below, en-US by default', category: 'Category, see below, All News by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    description: `Categories

| Category               | Slug                |
| ---------------------- | ------------------- |
| All News               |                     |
| Diablo II: Resurrected | diablo2             |
| Diablo III             | diablo3             |
| Diablo IV              | diablo4             |
| Diablo Immortal        | diablo-immortal     |
| Hearthstone            | hearthstone         |
| Heroes of the Storm    | heroes-of-the-storm |
| Overwatch 2            | overwatch           |
| StarCraft: Remastered  | starcraft           |
| StarCraft II           | starcraft2          |
| World of Warcraft      | world-of-warcraft   |
| Warcraft 3: Reforged   | warcraft3           |
| Warcraft Rumble        | warcraft-rumble     |
| Battle.net             | battlenet           |
| BlizzCon               | blizzcon            |
| Inside Blizzard        | blizzard            |

  Language codes

| Language           | Code  |
| ------------------ | ----- |
| Deutsch            | de-de |
| English (US)       | en-us |
| English (EU)       | en-gb |
| Español (EU)       | es-es |
| Español (Latino)   | es-mx |
| Français           | fr-fr |
| Italiano           | it-it |
| Português (Brasil) | pt-br |
| Polski             | pl-pl |
| Русский            | ru-ru |
| 한국어             | ko-kr |
| ภาษาไทย            | th-th |
| 日本語             | ja-jp |
| 繁體中文           | zh-tw |`,
};

const GAME_MAP = {
    diablo2: {
        key: 'diablo2',
        value: 'diablo-2-resurrected',
        id: 'blt54fbd3787a705054',
    },
    diablo3: {
        key: 'diablo3',
        value: 'diablo-3',
        id: 'blt2031aef34200656d',
    },
    diablo4: {
        key: 'diablo4',
        value: 'diablo-4',
        id: 'blt795c314400d7ded9',
    },
    'diablo-immortal': {
        key: 'diablo-immortal',
        value: 'diablo-immortal',
        id: 'blt525c436e4a1b0a97',
    },
    hearthstone: {
        key: 'hearthstone',
        value: 'hearthstone',
        id: 'blt5cfc6affa3ca0638',
    },
    'heroes-of-the-storm': {
        key: 'heroes-of-the-storm',
        value: 'heroes-of-the-storm',
        id: 'blt2e50e1521bb84dc6',
    },
    overwatch: {
        key: 'overwatch',
        value: 'overwatch',
        id: 'blt376fb94931906b6f',
    },
    starcraft: {
        key: 'starcraft',
        value: 'starcraft',
        id: 'blt81d46fcb05ab8811',
    },
    starcraft2: {
        key: 'starcraft2',
        value: 'starcraft-2',
        id: 'bltede2389c0a8885aa',
    },
    'world-of-warcraft': {
        key: 'world-of-warcraft',
        value: 'world-of-warcraft',
        id: 'blt2caca37e42f19839',
    },
    warcraft3: {
        key: 'warcraft3',
        value: 'warcraft-3',
        id: 'blt24859ba8086fb294',
    },
    'warcraft-rumble': {
        key: 'warcraft-rumble',
        value: 'warcraft-rumble',
        id: 'blte27d02816a8ff3e1',
    },
    battlenet: {
        key: 'battlenet',
        value: 'battle-net',
        id: 'blt90855744d00cd378',
    },
    blizzcon: {
        key: 'blizzcon',
        value: 'blizzcon',
        id: 'bltec70ad0ea4fd6d1d',
    },
    blizzard: {
        key: 'blizzard',
        value: 'blizzard',
        id: 'blt500c1f8b5470bfdb',
    },
};

function getSearchParams(category = 'all') {
    return category === 'all'
        ? Object.values(GAME_MAP)
              .map((item) => `feedCxpProductIds[]=${item.id}`)
              .join('&')
        : `feedCxpProductIds[]=${GAME_MAP[category].id}`;
}

async function handler(ctx) {
    const category = GAME_MAP[ctx.req.param('category')]?.key || 'all';
    const language = ctx.req.param('language') || 'en-us';
    const rootUrl = `https://news.blizzard.com/${language}`;
    const currentUrl = category === 'all' ? rootUrl : `${rootUrl}/?filter=${GAME_MAP[category].value}`;
    const apiUrl = `${rootUrl}/api/news/blizzard`;
    let rssTitle = '';

    const {
        data: {
            feed: { contentItems: response },
        },
    } = await got(`${apiUrl}?${getSearchParams(category)}`);

    const list = response.map((item) => {
        const content = item.properties;
        rssTitle = category === 'all' ? 'All News' : content.cxpProduct.title; // 这个是用来填充 RSS 订阅源频道级别 title，没别的地方能拿到了(而且会根据语言切换)
        return {
            title: content.title,
            link: content.newsUrl,
            author: content.author,
            category: content.category,
            guid: content.newsId,
            description: content.summary,
            pubDate: content.lastUpdated,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    item.description = $('.Content').html();
                    return item;
                } catch {
                    return item;
                }
            })
        )
    );

    return {
        title: rssTitle,
        link: currentUrl,
        item: items,
    };
}
