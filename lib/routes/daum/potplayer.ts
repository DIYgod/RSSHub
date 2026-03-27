import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { lang } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '500', 10);

    const baseUrl = 'https://t1.daumcdn.net';
    const targetUrl: string = new URL(`potplayer/PotPlayer/v4/Update2/Update${lang ?? ''}.html`, baseUrl).href;

    const response: string = await ofetch(targetUrl);

    // Updated regex to capture blocks:
    // Group 1: Leading hyphens (unused, but for context)
    // Group 2: Version and optional date line (e.g., "[1.4.20199]        2009/10/22" or "[250514]")
    // Group 3: Trailing hyphens (unused, but for context)
    // Group 4: Update content
    // Uses global and multiline flags for all matches and line start/end anchors
    const updateRegex = /^(-+)\s*\n(.*?)\s*\n(-+)\s*\n([\s\S]*?)(?=\n-{2,}|<\/p>)/gm;

    const items: DataItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = updateRegex.exec(response)) !== null && items.length < limit) {
        const headerLine: string | undefined = match[2].trim();
        const description: string | undefined = match[4].trim()?.replaceAll(/(\s[+-])/g, '<br>$1');

        let version = 'N/A';
        let pubDateStr: string | undefined = undefined;

        // Regex to extract version (e.g., [1.4.20199] or [250514])
        const versionMatch = headerLine.match(/\[([\d.]+)\]/);
        if (versionMatch && versionMatch[1]) {
            version = versionMatch[1];
        }

        // Regex to extract date (either YYYY/MM/DD or YYMMDD from the headerLine)
        const specificDateMatch = headerLine.match(/(\d{4}\/\d{1,2}\/\d{1,2})/); // YYYY/MM/DD format
        const numericDateMatch = headerLine.match(/(\d{6})/); // YYMMDD format

        if (specificDateMatch && specificDateMatch[1]) {
            // Found YYYY/MM/DD format
            pubDateStr = specificDateMatch[1].replaceAll('/', '-'); // Format to YYYY-MM-DD
        } else if (numericDateMatch && numericDateMatch[1]) {
            const rawDate = numericDateMatch[1];
            if (rawDate.length === 6 && (version === rawDate || !specificDateMatch)) {
                const year = Number.parseInt(rawDate.slice(0, 2), 10);
                const month = Number.parseInt(rawDate.slice(2, 4), 10);
                const day = Number.parseInt(rawDate.slice(4, 6), 10);
                const fullYear = year < 70 ? 2000 + year : 1900 + year;
                pubDateStr = `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
        }

        const guid = `potplayer-${lang}-${version}`;

        const processedItem: DataItem = {
            title: version,
            description,
            pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
            link: targetUrl,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            updated: pubDateStr ? parseDate(pubDateStr) : undefined,
        };

        items.push(processedItem);
    }

    return {
        title: 'PotPlayer Update History',
        link: targetUrl,
        item: items,
        allowEmpty: true,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/potplayer/:lang?',
    name: 'Potplayer Update History',
    url: 'potplayer.daum.net',
    maintainers: ['nczitzk'],
    handler,
    example: '/daum/potplayer',
    parameters: {
        lang: {
            description: 'Language, Korean by default',
            options: [
                {
                    label: '한국어',
                    value: 'Kor',
                },
                {
                    label: '中文(简体)',
                    value: 'Chs',
                },
                {
                    label: '中文(繁体)',
                    value: 'Cht',
                },
                {
                    label: 'English',
                    value: 'Eng',
                },
                {
                    label: 'Українська',
                    value: 'Eng',
                },
                {
                    label: 'Русский',
                    value: 'Rus',
                },
                {
                    label: 'Polski',
                    value: 'Pol',
                },
            ],
        },
    },
    description: `::: tip
To subscribe to [Potplayer Update History](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html), where the source URL is \`https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/daum/potplayer/Eng\`](https://rsshub.app/daum/potplayer/Eng).
:::

| Language                                                                           | Id                                           |
| ---------------------------------------------------------------------------------- | -------------------------------------------- |
| [한국어](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update.html)        |                                              |
| [中文(简体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html) | [Chs](https://rsshub.app/daum/potplayer/Chs) |
| [中文(繁体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateCht.html) | [Cht](https://rsshub.app/daum/potplayer/Cht) |
| [ENGLISH](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html)    | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [Українська](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html) | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [РУССКИЙ](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html)    | [Eng](https://rsshub.app/daum/potplayer/Rus) |
| [Polski](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html)     | [Eng](https://rsshub.app/daum/potplayer/Pol) |
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
            source: ['potplayer.daum.net'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const lang: string | undefined = urlObj.searchParams.get('lang') ?? undefined;

                return `/daum/potplayer${lang ? `/${lang}` : ''}`;
            },
        },
        {
            title: '한국어',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update.html'],
            target: '/potplayer',
        },
        {
            title: '中文(简体)',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html'],
            target: '/potplayer/Chs',
        },
        {
            title: '中文(繁体)',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateCht.html'],
            target: '/potplayer/Cht',
        },
        {
            title: 'English',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html'],
            target: '/potplayer/Eng',
        },
        {
            title: 'Українська',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html'],
            target: '/potplayer/Eng',
        },
        {
            title: 'Русский',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html'],
            target: '/potplayer/Rus',
        },
        {
            title: 'Polski',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html'],
            target: '/potplayer/Pol',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/potplayer/:lang?',
        name: 'PotPlayer 版本更新信息',
        url: 'potplayer.daum.net',
        maintainers: ['nczitzk'],
        handler,
        example: '/daum/potplayer/zh_CN',
        parameters: {
            lang: {
                description: '语言，默认为韩语，可在对应页 URL 中找到',
                options: [
                    {
                        label: '한국어',
                        value: 'Kor',
                    },
                    {
                        label: '中文(简体)',
                        value: 'Chs',
                    },
                    {
                        label: '中文(繁体)',
                        value: 'Cht',
                    },
                    {
                        label: 'English',
                        value: 'Eng',
                    },
                    {
                        label: 'Українська',
                        value: 'Eng',
                    },
                    {
                        label: 'Русский',
                        value: 'Rus',
                    },
                    {
                        label: 'Polski',
                        value: 'Pol',
                    },
                ],
            },
        },
        description: `::: tip
若订阅 [Potplayer Update History](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html)，网址为 \`https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html\`，请截取 \`https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update\` 到末尾的部分 \`Chs\` 作为 \`lang\` 参数填入，此时目标路由为 [\`/daum/potplayer/Chs\`](https://rsshub.app/daum/potplayer/Chs)。
:::

| Language                                                                           | Id                                           |
| ---------------------------------------------------------------------------------- | -------------------------------------------- |
| [한국어](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update.html)        |                                              |
| [中文(简体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html) | [Chs](https://rsshub.app/daum/potplayer/Chs) |
| [中文(繁体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateCht.html) | [Cht](https://rsshub.app/daum/potplayer/Cht) |
| [ENGLISH](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html)    | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [Українська](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html) | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [РУССКИЙ](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html)    | [Eng](https://rsshub.app/daum/potplayer/Rus) |
| [Polski](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html)     | [Eng](https://rsshub.app/daum/potplayer/Pol) |
`,
    },
};
