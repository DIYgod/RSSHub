import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const host = 'https://chaping.cn';

export const route: Route = {
    path: '/newsflash',
    categories: ['new-media'],
    example: '/chaping/newsflash',
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
            source: ['chaping.cn/newsflash'],
        },
    ],
    name: '快讯',
    maintainers: ['Fatpandac'],
    handler,
    url: 'chaping.cn/newsflash',
};

async function handler() {
    const newflashAPI = `${host}/api/official/information/newsflash?page=1&limit=21`;
    const response = await ofetch(newflashAPI);
    const data = response.data;

    return {
        title: '差评 快讯',
        link: `${host}/newsflash`,
        item:
            data &&
            data.map((item) => ({
                title: item.title,
                description: item.summary,
                pubDate: parseDate(item.time_publish_timestamp * 1000),
                link: item.origin_url,
            })),
    };
}
