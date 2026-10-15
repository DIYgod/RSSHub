import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const languageCodes: Record<string, Language> = {
    '': 'ko',
    Chs: 'zh-CN',
    Cht: 'zh-TW',
    Eng: 'en',
    Kor: 'ko',
    Pol: 'pl',
    Rus: 'ru',
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { lang } = ctx.req.param();
    const limit = getRouteLimit(ctx, 500);

    const baseUrl = 'https://t1.daumcdn.net';
    const languageSuffix = lang === 'Kor' ? '' : (lang ?? '');
    const targetUrl: string = new URL(`potplayer/PotPlayer/v4/Update2/Update${languageSuffix}.html`, baseUrl).href;

    const response: string = await ofetch(targetUrl);

    // Capture a nonempty version/date header and its notes between separator lines.
    const updateRegex = /^-+[^\S\n]*\n([^\S\r\n]*\S[^\r\n]*)\r?\n-+[^\S\n]*\n([\s\S]*?)(?=\n-{2}|<\/p>)/gm;

    const items = new Map<string, DataItem>();
    let match: RegExpExecArray | null;

    while ((match = updateRegex.exec(response)) !== null) {
        const headerLine: string | undefined = match[1].trim();
        const description: string | undefined = match[2].trim()?.replaceAll(/(\s[+-])/g, '<br>$1');

        // Historical translations also use unbracketed and compound version headers.
        const versionMatch = headerLine.match(/^\[?(\d+(?:\.\d+)*)/);
        if (!versionMatch) {
            continue;
        }
        const version = versionMatch[1];
        let pubDateStr: string | undefined = undefined;

        // Extract dates without treating dotted version numbers as calendar dates.
        const specificDateMatch = headerLine.match(/(\d{4}\/\d{1,2}\/\d{1,2})/); // YYYY/MM/DD format
        const europeanDateMatch = headerLine.match(/(?:^|\s)(\d{1,2})\.(\d{1,2})\.(\d{4})(?=\s|$)/); // DD.MM.YYYY format
        const numericDateMatch = headerLine.match(/(\d{6})/); // YYMMDD format

        if (specificDateMatch && specificDateMatch[1]) {
            // Found YYYY/MM/DD format
            pubDateStr = specificDateMatch[1].replaceAll('/', '-'); // Format to YYYY-MM-DD
        } else if (europeanDateMatch) {
            pubDateStr = `${europeanDateMatch[3]}-${europeanDateMatch[2]}-${europeanDateMatch[1]}`;
        } else if (numericDateMatch && numericDateMatch[1]) {
            const rawDate = numericDateMatch[1];
            if (rawDate.length === 6 && (version === rawDate || !specificDateMatch)) {
                const year = Number(rawDate.slice(0, 2));
                const month = Number(rawDate.slice(2, 4));
                const day = Number(rawDate.slice(4, 6));
                const fullYear = year < 70 ? 2000 + year : 1900 + year;
                pubDateStr = `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            }
        }

        const guid = `potplayer-${lang}-${version}`;
        const existingItem = items.get(guid);
        if (existingItem) {
            if (existingItem.description !== description) {
                existingItem.description = [existingItem.description, description].filter(Boolean).join('<br>');
                existingItem.content = { html: existingItem.description };
            }
            continue;
        }

        const processedItem: DataItem = {
            title: version,
            description,
            // The source provides calendar dates only; keep their UTC date anchor stable.
            pubDate: pubDateStr ? parseDate(`${pubDateStr} +0000`, 'YYYY-M-D ZZ') : undefined,
            link: targetUrl,
            guid,
            id: guid,
            content: {
                html: description,
            },
        };

        items.set(guid, processedItem);
    }

    return {
        title: 'PotPlayer Update History',
        language: languageCodes[lang ?? ''],
        link: targetUrl,
        item: items.values().toArray().slice(0, limit),
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
            description: 'Language, Korean by default; Kor is an alias for the default changelog',
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

| Language                                                                            | Id                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------- |
| [한국어](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update.html)         |                                              |
| [中文 (简体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html) | [Chs](https://rsshub.app/daum/potplayer/Chs) |
| [中文 (繁体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateCht.html) | [Cht](https://rsshub.app/daum/potplayer/Cht) |
| [ENGLISH](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html)     | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [РУССКИЙ](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html)     | [Rus](https://rsshub.app/daum/potplayer/Rus) |
| [Polski](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html)      | [Pol](https://rsshub.app/daum/potplayer/Pol) |`,
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
            title: '한국어',
            source: ['potplayer.daum.net'],
            target: '/potplayer',
        },
        {
            title: '中文(简体)',
            source: ['potplayer.daum.net'],
            target: '/potplayer/Chs',
        },
        {
            title: '中文(繁体)',
            source: ['potplayer.daum.net'],
            target: '/potplayer/Cht',
        },
        {
            title: 'English',
            source: ['potplayer.daum.net'],
            target: '/potplayer/Eng',
        },
        {
            title: 'Русский',
            source: ['potplayer.daum.net'],
            target: '/potplayer/Rus',
        },
        {
            title: 'Polski',
            source: ['potplayer.daum.net'],
            target: '/potplayer/Pol',
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
            title: 'Русский',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html'],
            target: '/potplayer/Rus',
        },
        {
            title: 'Polski',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html'],
            target: '/potplayer/Pol',
        },
        {
            title: '한국어',
            source: ['t1.daumcdn.net/potplayer/PotPlayer/Version/Latest/PotPlayerSetup.exe', 't1.daumcdn.net/potplayer/PotPlayer/Version/Latest/PotPlayerSetup64.exe'],
            target: '/potplayer',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/potplayer/:lang?',
        name: 'PotPlayer 版本更新信息',
        url: 'potplayer.daum.net',
        maintainers: ['nczitzk'],
        handler,
        example: '/daum/potplayer/Chs',
        parameters: {
            lang: {
                description: '语言，默认为韩语；Kor 为默认韩语日志的别名，其他语言可在对应页 URL 中找到',
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

| Language                                                                            | Id                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------- |
| [한국어](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/Update.html)         |                                              |
| [中文 (简体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateChs.html) | [Chs](https://rsshub.app/daum/potplayer/Chs) |
| [中文 (繁体)](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateCht.html) | [Cht](https://rsshub.app/daum/potplayer/Cht) |
| [ENGLISH](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateEng.html)     | [Eng](https://rsshub.app/daum/potplayer/Eng) |
| [РУССКИЙ](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdateRus.html)     | [Rus](https://rsshub.app/daum/potplayer/Rus) |
| [Polski](https://t1.daumcdn.net/potplayer/PotPlayer/v4/Update2/UpdatePol.html)      | [Pol](https://rsshub.app/daum/potplayer/Pol) |`,
    },
};
