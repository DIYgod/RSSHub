import bbobHTML from '@bbob/html';
import presetHTML5 from '@bbob/preset-html5';
import type { BBobCoreTagNodeTree, PresetFactory } from '@bbob/types';
import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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

export const handler = async (ctx) => {
    const { category = 'all', language = 'english' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://www.counter-strike.net';
    const apiRootUrl = 'https://store.steampowered.com';
    const cdnRootUrl = 'https://media.st.dl.eccdnx.com';
    const currentUrl = new URL(`news${category && category !== 'all' ? `/${category}` : ''}${language ? `?l=${language}` : ''}`, rootUrl).href;
    const apiUrl = new URL('events/ajaxgetpartnereventspageable/', apiRootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            clan_accountid: 0,
            appid: 730,
            offset: 0,
            count: limit,
            l: language,
        },
    });

    const items = response.events
        .filter((item) => (category === 'updates' ? item.event_type === 12 : item.event_type))
        .slice(0, limit)
        .map((item) => {
            const title = item.event_name;
            const description = bbobHTML(item.announcement_body.body, [customPreset(), swapLinebreak]);
            const guid = `counter-strike-news-${item.gid}`;

            return {
                title,
                description,
                pubDate: parseDate(item.announcement_body.posttime, 'X'),
                link: new URL(`newsentry/${item.gid}`, rootUrl).href,
                category: item.announcement_body.tags,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: item.announcement_body.body,
                },
                updated: parseDate(item.announcement_body.updatetime, 'X'),
            };
        });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const author = 'Counter Strike';
    const image = new URL('apps/csgo/images/dota_react//blog/default_cover.jpg', cdnRootUrl).href;

    return {
        title: `${author} - ${category === 'updates' ? 'Updates' : 'News'}`,
        description: $('title').text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/news/:category?/:language?',
    name: 'News',
    url: 'www.counter-strike.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/counter-strike/news',
    parameters: { category: 'Category, `updates` or `all`, `all` by default', language: 'Language, english by default, see below for more languages' },
    description: `::: tip
  If you subscribe to [Updates in English](https://www.counter-strike.net/news/updates?l=english)，where the URL is \`https://www.counter-strike.net/news/updates?l=english\`, extract the \`l\`, which is \`english\`, and use it as the parameter to fill in. Therefore, the route will be [\`/counter-strike/news/updates/english\`](https://rsshub.app/counter-strike/news/updates/english).
:::

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
            source: ['www.counter-strike.net/news/:category'],
            target: (params, url) => {
                url = new URL(url);
                const category = params.category;
                const language = url.searchParams.get('l');

                return `/news${category ? `/${category}${language ? `/${language}` : ''}` : ''}`;
            },
        },
    ],
};
