import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ani/new_anime',
    categories: ['anime'],
    view: ViewType.Videos,
    example: '/gamer/ani/new_anime',
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
            source: ['ani.gamer.com.tw/'],
            target: '/new_anime',
        },
    ],
    name: '動畫瘋 - 最後更新',
    maintainers: ['maple3142', 'pseudoyu'],
    handler,
    url: 'ani.gamer.com.tw/',
};

async function handler() {
    const rootUrl = 'https://ani.gamer.com.tw';
    const { data: response } = await got('https://api.gamer.com.tw/mobile_app/anime/v3/index.php');

    const items = response.data.newAnime.date.map((item) => ({
        title: `${item.title} ${item.volume}`,
        description: `<img src="${item.cover}">`,
        link: `${rootUrl}/animeVideo.php?sn=${item.videoSn}`,
        pubDate: timezone(parseDate(`${item.upTime} ${item.upTimeHours}`, 'MM/DD HH:mm'), +8),
    }));

    return {
        title: '動畫瘋最後更新',
        link: rootUrl,
        item: items,
    };
}
