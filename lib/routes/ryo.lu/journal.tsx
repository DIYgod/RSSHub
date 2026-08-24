import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import { renderYoutube } from '@/routes/youtube/utils';
import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface JournalEntry {
    id: string;
    slug?: string;
    date: string;
    dateTime: string;
    url?: string;
    href?: string;
    lang: string;
    title?: string;
    text: string;
    titleZh?: string;
    textZh?: string;
    titleJa?: string;
    textJa?: string;
    photos?: string[];
    youtube?: string;
    links?: Array<{ href: string; title: string; image: string | null }>;
}

export const route: Route = {
    path: '/journal/:lang?',
    categories: ['blog'],
    view: ViewType.Articles,
    example: '/ryo.lu/journal',
    parameters: {
        lang: {
            description: 'Language',
            default: 'en',
            options: [
                { value: 'en', label: 'English' },
                { value: 'zh', label: '中文' },
                { value: 'ja', label: '日本語' },
            ],
        },
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
            source: ['ryo.lu/journal', 'ryo.lu/'],
            target: '/journal',
        },
    ],
    name: 'Journal',
    maintainers: ['TonyRL'],
    handler,
    url: 'ryo.lu/journal',
};

const decodeJsStringLiteral = (raw: string): string =>
    JSON.parse(
        '"' +
            raw.replaceAll(/\\(?:x([\dA-Fa-f]{2})|(.))|"/g, (m, hex, ch) => {
                if (hex) {
                    return `\\u00${hex}`;
                }
                if (ch === "'") {
                    return "'";
                }
                if (ch === 'v' || ch === '0') {
                    return ch === 'v' ? String.raw`\u000b` : String.raw`\u0000`;
                }
                return m === '"' ? String.raw`\"` : m;
            }) +
            '"'
    );

async function handler(ctx): Promise<Data> {
    const lang = ctx.req.param('lang') ?? 'en';

    const baseUrl = 'https://ryo.lu';
    const html = await ofetch(`${baseUrl}/journal/`);
    const scriptPath = html.match(/\/static\/js\/main\.\w+\.js/)?.[0];
    if (!scriptPath) {
        throw new Error('Cannot find main script');
    }

    const script = await ofetch(`${baseUrl}${scriptPath}`, { responseType: 'text' });
    const start = script.indexOf("JSON.parse('[{");
    if (start === -1) {
        throw new Error('Cannot find journal data');
    }
    const rest = script.slice(start + "JSON.parse('".length);
    const literal = rest.slice(0, rest.indexOf("]')") + 1);
    const entries: JournalEntry[] = JSON.parse(decodeJsStringLiteral(literal));

    const suffix = lang === 'zh' ? 'Zh' : lang === 'ja' ? 'Ja' : '';
    const items = entries.map((entry) => {
        const title = (entry[`title${suffix}`] ?? entry.title) as string | undefined;
        const text = ((entry[`text${suffix}`] ?? entry.text) as string) || '';

        const description = renderToString(
            <>
                {text.split('\n').map((line, index) => (
                    <>
                        {index > 0 && <br />}
                        {line}
                    </>
                ))}
                {entry.photos?.map((photo) => (
                    <>
                        <br />
                        <img src={`${baseUrl}${photo}`} />
                    </>
                ))}
                {entry.youtube && (
                    <>
                        <br />
                        {raw(renderYoutube(true, entry.youtube, undefined, undefined))}
                    </>
                )}
                {entry.links?.map((link) => (
                    <>
                        <br />
                        <a href={link.href}>{link.title}</a>
                    </>
                ))}
                {entry.href && (
                    <>
                        <br />
                        <a href={`${baseUrl}${entry.href}`}>{`${baseUrl}${entry.href}`}</a>
                    </>
                )}
            </>
        );

        return {
            title: title ?? text.split('\n', 1)[0],
            description,
            link: `${baseUrl}/journal/${entry.slug ?? entry.id}?locale=${lang}`,
            guid: entry.id,
            pubDate: parseDate(entry.dateTime),
        };
    });

    return {
        title: 'Ryo’s Journal',
        link: `${baseUrl}/journal/`,
        description: 'Journal of Ryo Lu',
        language: lang === 'en' ? 'en' : lang === 'zh' ? 'zh-TW' : 'ja',
        item: items,
    };
}
