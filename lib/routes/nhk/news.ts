import { Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
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

async function handler(ctx) {
    const { lang = 'en' } = ctx.req.param();
    const { data } = await got(`${apiUrl}/nwapi/rdnewsweb/v7b/${lang}/outline/list.json`);
    const meta = await got(`${baseUrl}/nhkworld/common/assets/news/config/${lang}.json`);

    let items = data.data.map((item) => ({
        title: item.title,
        description: item.description,
        link: `${baseUrl}${item.page_url}`,
        pubDate: parseDate(item.updated_at, 'x'),
        id: item.id,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(`${apiUrl}/nwapi/rdnewsweb/v6b/${lang}/detail/${item.id}.json`);
                item.category = Object.values(data.data.categories);
                item.description = art(path.join(__dirname, 'templates/news.art'), {
                    img: data.data.thumbnails,
                    description: data.data.detail.replaceAll('\n\n', '<br><br>'),
                });
                delete item.id;
                return item;
            })
        )
    );

    return {
        title: `${Object.values(meta.data.config.navigation.header).find((h) => h.keyname === 'topstories')?.name} | NHK WORLD-JAPAN News`,
        link: `${baseUrl}/nhkworld/${lang}/news/list/`,
        item: items,
    };
}
