import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/k',
    categories: ['traditional-media'],
    example: '/caixin/k',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    name: '财新一线',
    maintainers: ['boypt'],
    handler,
};

async function handler() {
    const response = await got('https://k.caixin.com/app/v1/list', {
        searchParams: {
            productIdList: '8,28',
            uid: '',
            unit: 1,
            name: '',
            code: '',
            deviceType: '',
            device: '',
            userTag: '',
            p: 1,
            c: 20,
        },
    });

    const data = response.data.data.list;
    const items = data.map((item) => {
        const hasAudio = item.audio_url || Object.values(item.audios)[0];
        return {
            title: item.title,
            description: item.text,
            link: `http://k.caixin.com/web/detail_${item.oneline_news_code}`,
            pubDate: parseDate(item.ts, 'x'),
            author: '财新一线',
            enclosure_url: hasAudio ? item.audio_url || Object.values(item.audios)[0] : undefined,
            enclosure_type: hasAudio ? 'audio/mpeg' : undefined,
        };
    });

    return {
        title: '财新网 - 财新一线新闻',
        link: 'https://k.caixin.com/web/',
        description: '财新网 - 财新一线新闻',
        item: items,
    };
}
