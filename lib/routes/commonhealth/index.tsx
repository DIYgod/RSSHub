import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const apiKey = 'Cah2snYi52eJjpshbIfof1Tpx8ZhzXqh';

export const route: Route = {
    path: '/',
    name: '最新內容',
    url: 'commonhealth.com.tw',
    maintainers: ['johan456789'],
    example: '/commonhealth',
    categories: ['traditional-media'],
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
            source: ['www.commonhealth.com.tw/'],
            target: '/',
        },
    ],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.commonhealth.com.tw';
    const apiUrl = 'https://api-ch.commonhealth.com.tw/api/v3.0/latest_article/channel/focus/list';

    const headers = {
        accept: 'application/json',
        'api-key': apiKey,
    };

    const response = await ofetch(apiUrl, {
        headers,
        query: {
            page: 1,
        },
    });

    const items = response.items.list.map((item) => {
        const description = renderDescription(item.image, item.preface);

        return {
            title: item.title,
            link: item.link,
            pubDate: parseDate(item.item_datetime),
            description,
        };
    });

    return {
        title: '康健',
        link: rootUrl,
        language: 'zh-TW' as const,
        item: items,
    };
}

const renderDescription = (image: string, preface: string): string =>
    renderToString(
        <>
            <img src={image} alt="article image" />
            <p>{preface}</p>
        </>
    );
