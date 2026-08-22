import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/upcoming',
    categories: ['multimedia'],
    example: '/maoyan/upcoming',
    parameters: {},
    name: '即将上映',
    maintainers: ['HenryQW', 'JackyST0'],
    handler,
};

async function handler() {
    const data = await ofetch('https://m.maoyan.com/ajax/comingList?token=');

    const items = data.coming.map((item) => ({
        title: `${item.nm} ${item.comingTitle}`,
        description: `<img src="${item.img.replace('w.h', '1000.1000')}"> <br> 演员：${item.star} <br> 上映信息：${item.showInfo || item.comingTitle}`,
        link: `https://maoyan.com/films/${item.id}`,
        pubDate: timezone(parseDate(item.rt), 8),
    }));

    return {
        title: '猫眼电影 - 即将上映',
        link: 'https://maoyan.com/films?showType=2',
        description: '猫眼电影 - 即将上映',
        item: items,
    };
}
