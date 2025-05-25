import { Route, Data, DataItem } from '@/types';
import type { BBobCoreTagNodeTree, PresetFactory, NodeContent } from '@bbob/types';

import got from '@/utils/got';
import bbobHTML from '@bbob/html';
import presetHTML5 from '@bbob/preset-html5';
import { getUniqAttr } from '@bbob/plugin-helper';
import { parseDate } from '@/utils/parse-date';
import type { Context } from 'hono';

export const route: Route = {
    path: '/news/:appid/:language?',
    name: 'News',
    url: 'steamcommunity.com',
    maintainers: ['keocheung'],
    handler,
    example: '/news/958260/english',
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

const langMap = {
    english: 'en',
    german: 'de',
    french: 'fr',
    italian: 'it',
    korean: 'ko',
    spanish: 'es',
    schinese: 'zh-Hans',
    tchinese: 'zh-Hant',
    japanese: 'ja',
    portuguese: 'pt-PT',
    brazilian: 'pt-BR',
    russian: 'ru',
    polish: 'pl',
    danish: 'da',
    dutch: 'nl',
    finnish: 'fi',
    norwegian: 'no',
    swedish: 'sv',
    czech: 'cs',
    hungarian: 'hu',
    turkish: 'tr',
    thai: 'th',
    ukrainian: 'uk',
    vietnamese: 'vi',
    romanian: 'ro',
    greek: 'el',
    arabic: 'ar',
    latam: 'es-419',
    bulgarian: 'bg',
};

async function handler(ctx: Context): Promise<Data> {
    const { appid = '958260', language = 'english' } = ctx.req.param();
    const limitQuery = ctx.req.query('limit');
    const limit = limitQuery ? Number.parseInt(limitQuery, 10) : 100;

    const rootUrl = 'https://steamcommunity.com';
    const apiRootUrl = 'https://store.steampowered.com';
    const clanRootUrl = 'https://clan.fastly.steamstatic.com';
    const sharedRootUrl = 'https://shared.fastly.steamstatic.com';
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
        const description = `<div lang="${langMap[language] || ''}">${bbobHTML(
            item.announcement_body.body
                .replaceAll('{STEAM_CLAN_IMAGE}', `${clanRootUrl}/images`)
                .replaceAll('[olist]', '[list=1]')
                .replaceAll('[/olist]', '[/list]')
                .replaceAll(/(\[\/h\d\])\n/g, '$1')
                .replaceAll(/(\[list(?:=.*?)?\])\n/g, '$1'),
            [customPreset(), linebreakRenderer, plainUrlRenderer]
        )}</div>`;
        const jsondata = JSON.parse(item.jsondata);
        const titleImage = jsondata.localized_title_image ? jsondata.localized_capsule_image[0] : null;
        const capsuleImage = jsondata.localized_capsule_image ? jsondata.localized_capsule_image[0] : null;

        return {
            title,
            description,
            pubDate: parseDate(item.announcement_body.posttime, 'X'),
            link: new URL(`games/${appid}/announcements/detail/${item.announcement_body.gid}`, rootUrl).href,
            category: item.announcement_body.tags,
            content: {
                html: description,
                text: item.announcement_body.body,
            },
            updated: parseDate(item.announcement_body.updatetime, 'X'),
            image: new URL(`images/${item.announcement_body.clanid}/${capsuleImage}`, clanRootUrl).href,
            banner: new URL(`images/${item.announcement_body.clanid}/${titleImage}`, clanRootUrl).href,
        };
    });

    return {
        title: `App ${appid} News`,
        link: new URL(`app/${appid}/allnews/`, rootUrl).href,
        image: new URL(`store_item_assets/steam/apps/${appid}/hero_capsule.jpg`, sharedRootUrl).href,
        item: items,
        language: langMap[language] || null,
    };
}

const linebreakRenderer = (tree: BBobCoreTagNodeTree) =>
    tree.walk((node) => {
        if (typeof node === 'string' && node === '\n') {
            return {
                tag: 'br',
                content: null,
            };
        }
        return node;
    });

const plainUrlRenderer = (tree: BBobCoreTagNodeTree) =>
    tree.walk((node) => {
        if (typeof node === 'string' && /https?:\/\/[^\s]+/.test(node)) {
            let lastIndex = 0;
            let match: RegExpExecArray | null;
            const content: NodeContent[] = [];

            const urlRe = /https?:\/\/[^\s]+/g;
            while ((match = urlRe.exec(node)) !== null) {
                if (match.index > lastIndex) {
                    content.push(node.slice(lastIndex, match.index));
                }
                content.push({
                    tag: 'a',
                    attrs: {
                        href: match[0],
                        rel: 'noopener',
                        target: '_blank',
                    },
                    content: match[0],
                });

                lastIndex = match.index + match[0].length;
            }

            if (lastIndex < node.length) {
                content.push(node.slice(lastIndex));
            }

            if (content.length === 0) {
                return node;
            }
            if (content.length === 1) {
                return content[0];
            }
            return {
                tag: 'span',
                content,
            };
        }
        return node;
    });

const customPreset: PresetFactory = presetHTML5.extend((tags) => ({
    ...tags,
    b: (node) => ({
        tag: 'b',
        content: node.content,
    }),
    i: (node) => ({
        tag: 'i',
        content: node.content,
    }),
    u: (node) => ({
        tag: 'u',
        content: node.content,
    }),
    s: (node) => ({
        tag: 's',
        content: node.content,
    }),
    url: (node) => ({
        tag: 'a',
        attrs: {
            href: Object.keys(node.attrs as Record<string, string>)[0],
            rel: 'noopener',
            target: '_blank',
        },
        content: node.content,
    }),
    previewyoutube: (node) => ({
        tag: 'iframe',
        attrs: {
            src: `https://www.youtube-nocookie.com/embed/${(getUniqAttr(node.attrs) as string).match(/[A-Za-z0-9_-]+/)?.[0]}`,
            title: 'YouTube video player',
            frameborder: '0',
        },
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
