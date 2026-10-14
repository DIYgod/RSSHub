import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weekly',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/cngal/weekly',
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
            source: ['www.cngal.org/', 'www.cngal.org/weeklynews'],
        },
    ],
    name: '每周速报',
    maintainers: ['kmod-midori'],
    handler,
    url: 'www.cngal.org/',
};

async function handler() {
    const response = await got('https://api.cngal.org/api/news/GetWeeklyNewsOverview');

    return {
        title: 'CnGal - 每周速报',
        link: 'https://www.cngal.org/weeklynews',
        item: await Promise.all(
            response.data.map(async (item) => {
                const detail = await cache.tryGet<{ pubishTime?: string }>(`cngal:weekly:publication:${item.id}`, async () => {
                    const detailResponse = await got(`https://api.cngal.org/api/articles/GetArticleView/${item.id}`);
                    return { pubishTime: detailResponse.data.pubishTime };
                });

                return {
                    title: item.name,
                    description: renderDescription(item),
                    pubDate: detail.pubishTime ? parseDate(detail.pubishTime) : undefined,
                    updated: parseDate(item.lastEditTime),
                    link: `https://www.cngal.org/articles/index/${item.id}`,
                };
            })
        ),
    };
}

const renderDescription = (item): string => {
    const intro = item.briefIntroduction ? item.briefIntroduction.trim().replaceAll('\n', '<br>') : '';

    return renderToString(
        <>
            <p>{intro ? raw(intro) : null}</p>
            {item.mainImage ? <img src={item.mainImage} /> : null}
        </>
    );
};
