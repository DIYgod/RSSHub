import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const getPublicationDate = (value?: string | number | null): Date | undefined => {
    if ((typeof value !== 'string' || !/\S/.test(value)) && typeof value !== 'number') {
        return undefined;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
};

export const route: Route = {
    path: '/daily_briefing_chinese',
    categories: ['traditional-media'],
    example: '/nytimes/daily_briefing_chinese',
    parameters: {},
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
            source: ['nytimes.com/'],
            target: '',
        },
    ],
    name: 'Daily Briefing',
    maintainers: ['yueyericardo', 'nczitzk'],
    handler,
    url: 'nytimes.com/',
    description: 'URL: <https://www.nytimes.com/zh-hans/series/daily-briefing-chinese>',
};

async function handler() {
    const rootUrl = 'https://www.nytimes.com';
    const currentUrl = `${rootUrl}/zh-hans/series/daily-briefing-chinese`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const listData = JSON.parse(response.data.match(/"initialState":(.*),"config"/)[1]);

    let items: any[] = [];
    for (const [key, item] of Object.entries<any>(listData)) {
        if (key.startsWith('Article:') && item.url) {
            items.push({
                link: item.url,
                pubDate: getPublicationDate(item.firstPublished),
            });
        }
    }

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet<Partial<Pick<DataItem, 'title' | 'description' | 'author'>>>(`nytimes:daily:detail:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const images = (detailResponse.data.match(/"url":"[^{}]+","name":"articleLarge"/g) ?? []).map((e) => JSON.parse(`{${e}}`).url);

                let i = 0;
                content('figure').each((_, el) => {
                    content(el).html(
                        renderToString(
                            <figure>
                                <img src={images[i++]} />
                            </figure>
                        )
                    );
                });

                return {
                    title: content('meta[property="og:title"]').attr('content'),
                    author: content('meta[name="byl"]').attr('content')?.replace(/^By /, ''),
                    description: content('section[name="articleBody"]').html() ?? undefined,
                };
            });
            return { ...item, title: detail.title, author: detail.author, description: detail.description };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: 'Daily Briefing - The New York Times',
        link: currentUrl,
        item: items,
    };
}
