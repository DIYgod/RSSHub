import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www3.nhk.or.jp';
const apiUrl = 'https://api.nhkworld.jp';

export const route: Route = {
    path: '/news/:lang?',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/nhk/news/en',
    parameters: {
        lang: {
            description: 'Language, see below',
            options: [
                { value: 'ar', label: 'العربية' },
                { value: 'bn', label: 'বাংলা' },
                { value: 'my', label: 'မြန်မာဘာသာစကား' },
                { value: 'zh', label: '中文（简体）' },
                { value: 'zt', label: '中文（繁體）' },
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' },
                { value: 'hi', label: 'हिन्दी' },
                { value: 'id', label: 'Bahasa Indonesia' },
                { value: 'ko', label: '코리언' },
                { value: 'fa', label: 'فارسی' },
                { value: 'pt', label: 'Português' },
                { value: 'ru', label: 'Русский' },
                { value: 'es', label: 'Español' },
                { value: 'sw', label: 'Kiswahili' },
                { value: 'th', label: 'ภาษาไทย' },
                { value: 'tr', label: 'Türkçe' },
                { value: 'uk', label: 'Українська' },
                { value: 'ur', label: 'اردو' },
                { value: 'vi', label: 'Tiếng Việt' },
            ],
            default: 'en',
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
            source: ['www3.nhk.or.jp/nhkworld/:lang/news/list/', 'www3.nhk.or.jp/nhkworld/:lang/news/'],
            target: '/news/:lang',
        },
    ],
    name: 'WORLD-JAPAN - Top Stories',
    maintainers: ['TonyRL', 'pseudoyu', 'cscnk52'],
    handler,
};

type NewsOutline = {
    id: string;
    title: string;
    description: string;
    page_url: string;
    public_at: string;
    updated_at: string;
    categories: { name: string };
};

async function handler(ctx) {
    const { lang = 'en' } = ctx.req.param();
    const data = await ofetch<{ data: NewsOutline[] }>(`${apiUrl}/nwapi/rdnewsweb/v7b/${lang}/outline/list.json`);
    const meta = await ofetch(`${baseUrl}/nhkworld/common/assets/news/config/${lang}.json`);

    const list = data.data.map((item) => ({
        title: item.title,
        description: item.description,
        link: `${baseUrl}${item.page_url}`,
        pubDate: item.public_at ? parseDate(item.public_at, 'x') : undefined,
        updated: item.updated_at ? parseDate(item.updated_at, 'x') : undefined,
        category: item.categories.name,
        id: item.id,
    }));

    const items = await pMap(
        list,
        async ({ id, ...item }) => ({
            ...item,
            ...(await cache.tryGet(`nhk:news:details:v3:${item.link}`, async () => {
                const { data } = await ofetch(`${apiUrl}/nwapi/rdnewsweb/v6b/${lang}/detail/${id}.json`);
                const img = data.thumbnails;
                const imageSrc = img?.large || img?.middle || img?.small || img?.min;
                const description = data.detail.replaceAll('\n', '<br>');
                return {
                    description: renderToString(
                        <>
                            {imageSrc ? (
                                <>
                                    <img src={new URL(imageSrc, baseUrl).href} alt={img?.alt} />
                                    <br />
                                </>
                            ) : null}
                            {description ? raw(description) : null}
                        </>
                    ),
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: `${Object.values<any>(meta.config.navigation.header).find((h) => h.keyname === 'topstories' || h.keyname === 'top')?.name ?? 'Top Stories'} | NHK WORLD-JAPAN News`,
        link: `${baseUrl}/nhkworld/${lang}/news/list/`,
        item: items,
    };
}
