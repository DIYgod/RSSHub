import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/ratings/:language?',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/spglobal/ratings/en',
    parameters: {
        language: {
            description: '语言',
            options: [
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'pt', label: 'Português' },
                { value: 'jp', label: '日本語' },
                { value: 'ru', label: 'Русский' },
                { value: 'ar', label: 'العربية' },
            ],
        },
    },
    radar: [
        {
            source: ['www.spglobal.com/ratings/:language'],
        },
    ],
    name: 'Ratings',
    description: `| language | Description |
| -------- | ----------- |
| zh       | 中文        |
| en       | English     |
| es       | Español     |
| pt       | Português   |
| jp       | 日本語      |
| ru       | Русский     |
| ar       | العربية     |`,
    maintainers: ['Cedaric'],
    handler,
};

interface SearchDocument {
    es_title_t: string;
    es_url_s: string;
    es_unified_dt?: string;
    es_description_t?: string;
}

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';
    const link = `https://www.spglobal.com/ratings/${language}/`;
    const html = await ofetch(link, { responseType: 'text' });
    const $ = load(html);
    const list = $('[dynamic-list-url]').first();
    const searchUrl = list.attr('dynamic-list-url');
    const authPath = list.attr('search-auth-token-endpoint');
    if (!searchUrl || !authPath) {
        throw new Error('S&P Global did not provide the public ratings search endpoint.');
    }
    const queryUrl = new URL(searchUrl, link);
    queryUrl.searchParams.set('start', '0');
    queryUrl.searchParams.set('rows', '10');
    const { token } = await ofetch<{ token: string }>(new URL(`/${authPath}`, link).href);
    const response = await ofetch<{ response: { docs: SearchDocument[] } }>(queryUrl.href, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return {
        title: `S&P Global Ratings(${language})`,
        link,
        item: response.response.docs.map((item) => ({
            title: item.es_title_t,
            pubDate: item.es_unified_dt ? parseDate(item.es_unified_dt) : undefined,
            link: new URL(item.es_url_s, link).href,
            description: item.es_description_t,
        })),
    };
}
