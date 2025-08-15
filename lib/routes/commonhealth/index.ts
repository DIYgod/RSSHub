import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

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
        const description = art(path.join(__dirname, 'templates/description.art'), {
            image: item.image,
            preface: item.preface,
        });

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
