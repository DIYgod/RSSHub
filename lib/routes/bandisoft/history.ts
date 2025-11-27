import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const idOptions = [
    {
        label: 'Bandizip',
        value: 'bandizip',
    },
    {
        label: 'Bandizip for Mac',
        value: 'bandizip.mac',
    },
    {
        label: 'BandiView',
        value: 'bandiview',
    },
    {
        label: 'Honeycam',
        value: 'honeycam',
    },
];

const languageOptions = [
    {
        label: 'English',
        value: 'en',
    },
    {
        label: '中文(简体)',
        value: 'cn',
    },
    {
        label: '中文(繁體)',
        value: 'tw',
    },
    {
        label: '日本語',
        value: 'jp',
    },
    {
        label: 'Русский',
        value: 'ru',
    },
    {
        label: 'Español',
        value: 'es',
    },
    {
        label: 'Français',
        value: 'fr',
    },
    {
        label: 'Deutsch',
        value: 'de',
    },
    {
        label: 'Italiano',
        value: 'it',
    },
    {
        label: 'Slovenčina',
        value: 'sk',
    },
    {
        label: 'Українська',
        value: 'uk',
    },
    {
        label: 'Беларуская',
        value: 'be',
    },
    {
        label: 'Dansk',
        value: 'da',
    },
    {
        label: 'Polski',
        value: 'pl',
    },
    {
        label: 'Português Brasileiro',
        value: 'br',
    },
    {
        label: 'Čeština',
        value: 'cs',
    },
    {
        label: 'Nederlands',
        value: 'nl',
    },
    {
        label: 'Slovenščina',
        value: 'sl',
    },
    {
        label: 'Türkçe',
        value: 'tr',
    },
    {
        label: 'ภาษาไทย',
        value: 'th',
    },
    {
        label: 'Ελληνικά',
        value: 'gr',
    },
    {
        label: "O'zbek",
        value: 'uz',
    },
    {
        label: 'Romanian',
        value: 'ro',
    },
    {
        label: '한국어',
        value: 'kr',
    },
];

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'bandizip', language = 'en' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '500', 10);

    const validIds: Set<string> = new Set(idOptions.map((option) => option.value));

    if (!validIds.has(id)) {
        throw new Error(`Invalid id: ${id}. Allowed values are: ${[...validIds].join(', ')}`);
    }

    const validLanguages: Set<string> = new Set(languageOptions.map((option) => option.value));

    if (!validLanguages.has(language)) {
        throw new Error(`Invalid language: ${language}. Allowed values are: ${[...validLanguages].join(', ')}`);
    }

    const baseUrl: string = `https://${language}.bandisoft.com`;
    const targetUrl: string = new URL(`${id}/history/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const lang = $('html').attr('lang') ?? 'en';
    const author: string | undefined = $('meta[name="author"]').attr('content');

    const items: DataItem[] = $('div.row')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const version: string | undefined = $el.find('div.cell1').text();
            const pubDateStr: string | undefined = $el.find('div.cell2').text();

            const title: string = version;
            const description: string | undefined = $el.find('ul.cell3').html() ?? undefined;

            const linkUrl: string = targetUrl;
            const guid: string = `bandisoft-${id}-${language}-${version}`;
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl,
                author,
                guid,
                id: guid,
                content: {
                    html: description,
                    text: description,
                },
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language: lang,
            };

            return processedItem;
        });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('img#logo_light').attr('src'),
        author,
        language: lang,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/history/:id?/:language?',
    name: 'History',
    url: 'www.bandisoft.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/bandisoft/history/bandizip',
    parameters: {
        id: {
            description: 'ID, `bandizip` by default',
            options: idOptions,
        },
        language: {
            description: 'Language, `en` by default',
            options: languageOptions,
        },
    },
    description: `::: tip
To subscribe to [Bandizip Version History](https://www.bandisoft.com/bandizip/history/), where the source URL is \`https://www.bandisoft.com/bandizip/history/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/bandisoft/history/bandizip\`](https://rsshub.app/bandisoft/history/bandizip).
:::

<details>
  <summary>More languages</summary>

| Language             | ID  |
| -------------------- | --- |
| English              | en  |
| 中文(简体)           | cn  |
| 中文(繁體)           | tw  |
| 日本語               | jp  |
| Русский              | ru  |
| Español              | es  |
| Français             | fr  |
| Deutsch              | de  |
| Italiano             | it  |
| Slovenčina           | sk  |
| Українська           | uk  |
| Беларуская           | be  |
| Dansk                | da  |
| Polski               | pl  |
| Português Brasileiro | br  |
| Čeština              | cs  |
| Nederlands           | nl  |
| Slovenščina          | sl  |
| Türkçe               | tr  |
| ภาษาไทย              | th  |
| Ελληνικά             | gr  |
| Oʻzbek               | uz  |
| Romanian             | ro  |
| 한국어               | kr  |

</details>
`,
    categories: ['program-update'],
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
            source: ['www.bandisoft.com/:id/history'],
            target: (params) => {
                const id: string = params.id;

                return `/bandisoft/history${id ? `/${id}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/history/:id?/:language?',
        name: '更新记录',
        url: 'www.bandisoft.com',
        maintainers: ['nczitzk'],
        handler,
        example: '/bandisoft/history/bandizip',
        parameters: {
            id: {
                description: 'ID, 默认为 `bandizip`，可在对应产品页 URL 中找到',
                options: idOptions,
            },
            language: {
                description: '地区, 默认为 `en`',
                options: languageOptions,
            },
        },
        description: `::: tip
若订阅 [Bandizip 更新记录](https://cn.bandisoft.com/bandizip/history/)，网址为 \`https://cn.bandisoft.com/bandizip/history/\`，请截取 \`cn\` 作为 \`category\` 参数填入，此时目标路由为 [\`/bandisoft/:language?/:id?\`](https://rsshub.app/bandisoft/:language?/:id?)。
:::

<details>
  <summary>更多语言</summary>

| Language             | ID  |
| -------------------- | --- |
| English              | en  |
| 中文(简体)           | cn  |
| 中文(繁體)           | tw  |
| 日本語               | jp  |
| Русский              | ru  |
| Español              | es  |
| Français             | fr  |
| Deutsch              | de  |
| Italiano             | it  |
| Slovenčina           | sk  |
| Українська           | uk  |
| Беларуская           | be  |
| Dansk                | da  |
| Polski               | pl  |
| Português Brasileiro | br  |
| Čeština              | cs  |
| Nederlands           | nl  |
| Slovenščina          | sl  |
| Türkçe               | tr  |
| ภาษาไทย              | th  |
| Ελληνικά             | gr  |
| Oʻzbek               | uz  |
| Romanian             | ro  |
| 한국어               | kr  |

</details>
`,
    },
};
