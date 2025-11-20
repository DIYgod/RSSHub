import { type Data, type Route, ViewType } from '@/types';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

export const handler = async (ctx: Context): Promise<Data> => {
    const { filter } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const apiSlug = 'wp-json/wp/v2';

    const baseUrl: string = 'https://jbma.net';
    const apiUrl = new URL(`${apiSlug}/report`, baseUrl).href;
    let targetUrl: string = new URL('report/', baseUrl).href;

    const [taxonomy, keyword] = filter ? (filter.includes('/') ? filter.split('/') : [undefined, filter]) : [undefined, undefined];

    let searchId: number | undefined = undefined;

    if (taxonomy && keyword) {
        const apiSearchUrl = new URL(`${apiSlug}/${taxonomy}`, baseUrl).href;

        const searchResponse = await ofetch(apiSearchUrl, {
            query: {
                search: keyword,
            },
        });

        const searchObj = searchResponse.find((c) => c.slug === keyword || c.name === keyword);
        searchId = searchObj?.id ?? undefined;
        targetUrl = searchObj?.link ?? targetUrl;
    }

    const response = await ofetch(apiUrl, {
        query: {
            _embed: 'true',
            per_page: limit,
            ...(taxonomy && searchId
                ? {
                      [taxonomy as string]: searchId,
                  }
                : {
                      search: keyword,
                  }),
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'ja';

    const postIds: number[] = [];
    const regExp = new RegExp(String.raw`^${baseUrl.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)}/?(?:[a-zA-Z0-9-]+/)*\?p=\d+$`);

    for (const item of response.slice(0, limit)) {
        const linkUrl: string | undefined = item.link;
        if (linkUrl && regExp.test(linkUrl)) {
            postIds.push(item.id);
        }
    }

    const mediaMap: Map<number, any> = new Map();
    if (postIds.length > 0) {
        const mediaApiUrl = new URL(`${apiSlug}/media`, baseUrl).href;
        const mediaResponse = await ofetch(mediaApiUrl, {
            query: {
                parent: postIds.join(','),
                per_page: 100,
            },
        });

        for (const media of mediaResponse) {
            if (media.parent) {
                const existing = mediaMap.get(media.parent);
                if (existing) {
                    existing.push(media);
                } else {
                    mediaMap.set(media.parent, [media]);
                }
            }
        }
    }

    const items = response.slice(0, limit).map((item) => {
        const title = item.title?.rendered ?? item.title;
        const description = item.content?.rendered ?? undefined;
        const pubDate = item.date_gmt;

        const terminologies = item._embedded?.['wp:term'];

        const categories = terminologies?.flat().map((c) => c.name) ?? [];
        const authors =
            item._embedded?.author?.map((author) => ({
                name: author.name,
                url: author.link,
                avatar: author.avatar_urls?.['96'] ?? author.avatar_urls?.['48'] ?? author.avatar_urls?.['24'] ?? undefined,
            })) ?? [];
        const guid = item.guid?.rendered ?? item.guid;
        const updated = item.modified_gmt ?? pubDate;

        let image = item._embedded?.['wp:featuredmedia']?.[0].source_url ?? undefined;
        let enclosureUrl: string | undefined;
        let enclosureType: string | undefined;
        let enclosureTitle: string | undefined;
        let enclosureLength: number | undefined;

        let linkUrl = item.link;

        if (linkUrl && regExp.test(linkUrl)) {
            const mediaItems = mediaMap.get(item.id);

            if (mediaItems && mediaItems.length > 0) {
                const media = mediaItems[0];
                if (media.source_url) {
                    enclosureUrl = media.source_url;
                    enclosureType = media.mime_type;
                    enclosureTitle = media.title?.rendered ?? media.title;
                    enclosureLength = Number(media.media_details?.filesize);
                    linkUrl = enclosureUrl;
                }
                if (!image && media.media_details?.sizes?.full?.source_url) {
                    image = media.media_details.sizes.full.source_url;
                }
            }
        }

        if (!linkUrl || regExp.test(linkUrl)) {
            linkUrl = new URL(`report/${item.slug}`, baseUrl).href;
        }

        let processedItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl ?? guid,
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        if (enclosureUrl) {
            processedItem = {
                ...processedItem,
                enclosure_url: enclosureUrl,
                enclosure_type: enclosureType,
                enclosure_title: enclosureTitle || title,
                enclosure_length: enclosureLength,
            };
        }

        return processedItem;
    });

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: targetUrl,
    };
};

const options = [
    {
        label: 'すべて',
        value: '',
    },
    {
        label: 'Metals Forcus',
        value: 'cat_report/metals-forcus',
    },
    {
        label: 'WPIC',
        value: 'cat_report/wpic',
    },
    {
        label: 'Incrementum',
        value: 'cat_report/incrementum',
    },
    {
        label: '東京金融取引所',
        value: 'cat_report/tfx',
    },
    {
        label: '池水執筆・出演',
        value: 'cat_report/ikemizu',
    },
    {
        label: 'note',
        value: 'cat_report/note',
    },
    {
        label: 'その他',
        value: 'cat_report/other',
    },
    {
        label: 'In Gold We Trust',
        value: 'tag_report/in-gold-we-trust',
    },
    {
        label: 'Precious Metals Weeklyレポート',
        value: 'tag_report/precious-metals-weekly-report',
    },
    {
        label: 'ひろこのマーケットラウンジ',
        value: 'tag_report/market-lounge',
    },
    {
        label: 'その他',
        value: 'tag_report/other',
    },
    {
        label: '四半期レポート',
        value: 'tag_report/quarterly-report',
    },
    {
        label: 'プラチナ展望',
        value: 'tag_report/tenbo',
    },
    {
        label: 'Gold Compass',
        value: 'tag_report/gold-compass',
    },
    {
        label: '豆知識',
        value: 'tag_report/mamechishiki',
    },
    {
        label: 'プラチナ投資のエッセンス',
        value: 'tag_report/essence',
    },
    {
        label: '三菱UFJ信託銀行',
        value: 'tag_report/mufg',
    },
    {
        label: '石福金属興業',
        value: 'tag_report/ishifuku',
    },
    {
        label: 'OANDA 証券',
        value: 'tag_report/oanda',
    },
    {
        label: 'レポート',
        value: 'tag_report/report',
    },
];

const filterTable = `
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [Metals Forcus](https://jbma.net/cat_report/metals-forcus/)                                   | [cat_report/metals-forcus](https://rsshub.app/jbma/report/cat_report/metals-forcus)                                 |
| [WPIC](https://jbma.net/cat_report/wpic/)                                                     | [cat_report/wpic](https://rsshub.app/jbma/report/cat_report/wpic)                                                   |
| [Incrementum](https://jbma.net/cat_report/incrementum/)                                       | [cat_report/incrementum](https://rsshub.app/jbma/report/cat_report/incrementum)                                     |
| [東京金融取引所](https://jbma.net/cat_report/tfx/)                                            | [cat_report/tfx](https://rsshub.app/jbma/report/cat_report/tfx)                                                     |
| [池水執筆・出演](https://jbma.net/cat_report/ikemizu/)                                        | [cat_report/ikemizu](https://rsshub.app/jbma/report/cat_report/ikemizu)                                             |
| [note](https://jbma.net/cat_report/note/)                                                     | [cat_report/note](https://rsshub.app/jbma/report/cat_report/note)                                                   |
| [その他](https://jbma.net/cat_report/other/)                                                  | [cat_report/other](https://rsshub.app/jbma/report/cat_report/other)                                                 |
| [In Gold We Trust](https://jbma.net/tag_report/in-gold-we-trust/)                             | [tag_report/in-gold-we-trust](https://rsshub.app/jbma/report/tag_report/in-gold-we-trust)                           |
| [Precious Metals Weekly レポート](https://jbma.net/tag_report/precious-metals-weekly-report/) | [tag_report/precious-metals-weekly-report](https://rsshub.app/jbma/report/tag_report/precious-metals-weekly-report) |
| [ひろこのマーケットラウンジ](https://jbma.net/tag_report/market-lounge/)                      | [tag_report/market-lounge](https://rsshub.app/jbma/report/tag_report/market-lounge)                                 |
| [その他](https://jbma.net/tag_report/other/)                                                  | [tag_report/other](https://rsshub.app/jbma/report/tag_report/other)                                                 |
| [四半期レポート](https://jbma.net/tag_report/quarterly-report/)                               | [tag_report/quarterly-report](https://rsshub.app/jbma/report/tag_report/quarterly-report)                           |
| [プラチナ展望](https://jbma.net/tag_report/tenbo/)                                            | [tag_report/tenbo](https://rsshub.app/jbma/report/tag_report/tenbo)                                                 |
| [Gold Compass](https://jbma.net/tag_report/gold-compass/)                                     | [tag_report/gold-compass](https://rsshub.app/jbma/report/tag_report/gold-compass)                                   |
| [豆知識](https://jbma.net/tag_report/mamechishiki/)                                           | [tag_report/mamechishiki](https://rsshub.app/jbma/report/tag_report/mamechishiki)                                   |
| [プラチナ投資のエッセンス](https://jbma.net/tag_report/essence/)                              | [tag_report/essence](https://rsshub.app/jbma/report/tag_report/essence)                                             |
| [三菱 UFJ 信託銀行](https://jbma.net/tag_report/mufg/)                                        | [tag_report/mufg](https://rsshub.app/jbma/report/tag_report/mufg)                                                   |
| [石福金属興業](https://jbma.net/tag_report/ishifuku/)                                         | [tag_report/ishifuku](https://rsshub.app/jbma/report/tag_report/ishifuku)                                           |
| [OANDA 証券](https://jbma.net/tag_report/oanda/)                                              | [tag_report/oanda](https://rsshub.app/jbma/report/tag_report/oanda)                                                 |
| [レポート](https://jbma.net/tag_report/report/)                                               | [tag_report/report](https://rsshub.app/jbma/report/tag_report/report)                                               |

`;

export const route: Route = {
    path: '/report/:filter{.+}?',
    name: 'Precious Metals Report',
    url: 'jbma.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/jbma/report',
    parameters: {
        filter: {
            description: 'Filter, all by default, can be found in the corresponding page URL',
            options,
        },
    },
    description:
        `::: tip
To subscribe to [Metals Forcus](https://jbma.net/cat_report/metals-forcus/), where the source URL is \`https://jbma.net/cat_report/metals-forcus/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/jbma/report/cat_report/metals-forcus\`](https://rsshub.app/jbma/report/cat_report/metals-forcus).
:::

<details>
  <summary>More filters</summary>

| Name                                                                                          | ID                                                                                                                  |` +
        filterTable +
        `
</details>
`,
    categories: ['new-media'],
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
            source: ['jbma.net/:type/:name?'],
            target: (params) => {
                const type: string = params.type;
                const name: string = params.name;

                if (type === 'report' || type === 'cat_report' || type === 'tag_report') {
                    return `/${type}${name ? `/${name}` : ''}`;
                }

                return `/${type}`;
            },
        },
        {
            title: 'Metals Forcus',
            source: ['jbma.net/cat_report/metals-forcus'],
            target: '/report/cat_report/metals-forcus',
        },
        {
            title: 'WPIC',
            source: ['jbma.net/cat_report/wpic'],
            target: '/report/cat_report/wpic',
        },
        {
            title: 'Incrementum',
            source: ['jbma.net/cat_report/incrementum'],
            target: '/report/cat_report/incrementum',
        },
        {
            title: '東京金融取引所',
            source: ['jbma.net/cat_report/tfx'],
            target: '/report/cat_report/tfx',
        },
        {
            title: '池水執筆・出演',
            source: ['jbma.net/cat_report/ikemizu'],
            target: '/report/cat_report/ikemizu',
        },
        {
            title: 'note',
            source: ['jbma.net/cat_report/note'],
            target: '/report/cat_report/note',
        },
        {
            title: 'その他',
            source: ['jbma.net/cat_report/other'],
            target: '/report/cat_report/other',
        },
        {
            title: 'In Gold We Trust',
            source: ['jbma.net/tag_report/in-gold-we-trust'],
            target: '/report/tag_report/in-gold-we-trust',
        },
        {
            title: 'Precious Metals Weeklyレポート',
            source: ['jbma.net/tag_report/precious-metals-weekly-report'],
            target: '/report/tag_report/precious-metals-weekly-report',
        },
        {
            title: 'ひろこのマーケットラウンジ',
            source: ['jbma.net/tag_report/market-lounge'],
            target: '/report/tag_report/market-lounge',
        },
        {
            title: 'その他',
            source: ['jbma.net/tag_report/other'],
            target: '/report/tag_report/other',
        },
        {
            title: '四半期レポート',
            source: ['jbma.net/tag_report/quarterly-report'],
            target: '/report/tag_report/quarterly-report',
        },
        {
            title: 'プラチナ展望',
            source: ['jbma.net/tag_report/tenbo'],
            target: '/report/tag_report/tenbo',
        },
        {
            title: 'Gold Compass',
            source: ['jbma.net/tag_report/gold-compass'],
            target: '/report/tag_report/gold-compass',
        },
        {
            title: '豆知識',
            source: ['jbma.net/tag_report/mamechishiki'],
            target: '/report/tag_report/mamechishiki',
        },
        {
            title: 'プラチナ投資のエッセンス',
            source: ['jbma.net/tag_report/essence'],
            target: '/report/tag_report/essence',
        },
        {
            title: '三菱UFJ信託銀行',
            source: ['jbma.net/tag_report/mufg'],
            target: '/report/tag_report/mufg',
        },
        {
            title: '石福金属興業',
            source: ['jbma.net/tag_report/ishifuku'],
            target: '/report/tag_report/ishifuku',
        },
        {
            title: 'OANDA 証券',
            source: ['jbma.net/tag_report/oanda'],
            target: '/report/tag_report/oanda',
        },
        {
            title: 'レポート',
            source: ['jbma.net/tag_report/report'],
            target: '/report/tag_report/report',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/report/:filter{.+}?',
        name: '贵金属报告',
        url: 'jbma.net',
        maintainers: ['nczitzk'],
        handler,
        example: '/jbma/report',
        parameters: {
            filter: {
                description: '过滤条件，默认为全部，可在对应页 URL 中找到',
                options,
            },
        },
        description:
            `::: tip
若订阅 [Metals Forcus](https://jbma.net/cat_report/metals-forcus/)，网址为 \`https://jbma.net/cat_report/metals-forcus/\`，请截取 \`https://jbma.net/\` 到末尾 \`/\` 的部分 \`cat_report/metals-forcus\` 作为 \`filter\` 参数填入，此时目标路由为 [\`/jbma/report/cat_report/metals-forcus\`](https://rsshub.app/jbma/report/cat_report/metals-forcus)。
:::

<details>
  <summary>更多分类</summary>

| 名称                                                                                          | ID                                                                                                                  |` +
            filterTable +
            `
</details>
`,
    },
};
