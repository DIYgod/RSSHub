import { Route, Data, DataItem } from '@/types';
import type { BBobCoreTagNodeTree, PresetFactory } from '@bbob/types';

import got from '@/utils/got';
import bbobHTML from '@bbob/html';
import presetHTML5 from '@bbob/preset-html5';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';

export const route: Route = {
    path: '/news/:appid/:language?',
    name: 'News',
    url: 'steamcommunity.com',
    maintainers: ['keocheung'],
    handler,
    example: '/news/958260',
    parameters: {
        appid: 'Game App ID, all digits, can be found in the URL',
        language: 'Language, english by default, see below for more languages',
    },
    description: `
<details>
<summary>More languages</summary>

| 语言代码                                          | 语言名称   |
| ------------------------------------------------- | ---------- |
| English                                           | english    |
| Español - España (Spanish - Spain)                | spanish    |
| Français (French)                                 | french     |
| Italiano (Italian)                                | italian    |
| Deutsch (German)                                  | german     |
| Ελληνικά (Greek)                                  | greek      |
| 한국어 (Korean)                                   | koreana    |
| 简体中文 (Simplified Chinese)                     | schinese   |
| 繁體中文 (Traditional Chinese)                    | tchinese   |
| Русский (Russian)                                 | russian    |
| ไทย (Thai)                                        | thai       |
| 日本語 (Japanese)                                 | japanese   |
| Português (Portuguese)                            | portuguese |
| Português - Brasil (Portuguese - Brazil)          | brazilian  |
| Polski (Polish)                                   | polish     |
| Dansk (Danish)                                    | danish     |
| Nederlands (Dutch)                                | dutch      |
| Suomi (Finnish)                                   | finnish    |
| Norsk (Norwegian)                                 | norwegian  |
| Svenska (Swedish)                                 | swedish    |
| Čeština (Czech)                                   | czech      |
| Magyar (Hungarian)                                | hungarian  |
| Română (Romanian)                                 | romanian   |
| Български (Bulgarian)                             | bulgarian  |
| Türkçe (Turkish)                                  | turkish    |
| Українська (Ukrainian)                            | ukrainian  |
| Tiếng Việt (Vietnamese)                           | vietnamese |
| Español - Latinoamérica (Spanish - Latin America) | latam      |

</details>
    `,
    categories: ['game'],
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
            title: 'News',
            source: ['steamcommunity.com/app/:appid', 'steamcommunity.com/app/:appid/allnews', 'steamcommunity.com/app/:appid/announcements', 'steamcommunity.com/app/:appid/news'],
            target: '/news/:appid',
        },
    ],
};

async function handler(ctx: Context): Promise<Data> {
    const { appid = '1810920', language = 'english' } = ctx.req.param();
    const limitQuery = ctx.req.query('limit');
    const limit = limitQuery ? Number.parseInt(limitQuery, 10) : 100;

    const rootUrl = 'https://steamcommunity.com';
    const apiRootUrl = 'https://store.steampowered.com';
    const cdnRootUrl = 'https://clan.steamstatic.com/images';
    const apiUrl = new URL('events/ajaxgetpartnereventspageable/', apiRootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            clan_accountid: 0,
            appid,
            offset: 0,
            count: limit,
            l: language,
        },
    });

    const items: DataItem[] = response.events.slice(0, limit).map((item): DataItem => {
        const title = item.event_name;
        const description = bbobHTML(item.announcement_body.body.replaceAll('{STEAM_CLAN_IMAGE}', cdnRootUrl), [customPreset(), swapLinebreak]);

        return {
            title,
            description,
            pubDate: parseDate(item.announcement_body.posttime, 'X'),
            link: new URL(`games/${appid}/announcements/details/${item.announcement_body.gid}`, rootUrl).href,
            category: item.announcement_body.tags,
            content: {
                html: description,
                text: item.announcement_body.body,
            },
            updated: parseDate(item.announcement_body.updatetime, 'X'),
        };
    });

    return {
        title: `App ${appid} News`,
        link: `https://steamcommunity.com/app/${appid}/allnews/`,
        item: items,
    };
}

const swapLinebreak = (tree: BBobCoreTagNodeTree) =>
    tree.walk((node) => {
        if (typeof node === 'string' && node === '\n') {
            return {
                tag: 'br',
                content: null,
            };
        }
        return node;
    });

const customPreset: PresetFactory = presetHTML5.extend((tags) => ({
    ...tags,
    url: (node) => ({
        tag: 'a',
        attrs: {
            href: Object.keys(node.attrs as Record<string, string>)[0],
            rel: 'noopener',
            target: '_blank',
        },
        content: node.content,
    }),
    video: (node, { render }) => ({
        tag: 'video',
        attrs: {
            controls: '',
            preload: 'metadata',
            poster: node.attrs?.poster,
        },
        content: render(
            Object.entries({
                webm: 'video/webm',
                mp4: 'video/mp4',
            }).map(([key, type]) => ({
                tag: 'source',
                attrs: {
                    src: node.attrs?.[key],
                    type,
                },
            }))
        ),
    }),
}));
