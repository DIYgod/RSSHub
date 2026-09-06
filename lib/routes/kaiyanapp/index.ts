import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/index',
    categories: ['multimedia'],
    example: '/kaiyanapp/index',
    name: '每日精选',
    maintainers: ['sunshinenny'],
    handler,
};

async function handler() {
    const response = await ofetch('https://baobab.kaiyanapp.com/api/v5/index/tab/allRec');

    const list = response.itemList[0].data.itemList;

    const items = list
        .filter((item) => item.type === 'followCard')
        .map((item) => {
            const { data } = item.data.content;
            const videoUrl = data.playUrl;

            return {
                title: data.title,
                link: videoUrl,
                author: data.author.name,
                description: `${data.description}<br/><img src="${data.cover.feed}" /><br/><video src="${videoUrl}" controls="controls"></video>`,
                pubDate: parseDate(item.data.header.time),
            };
        });

    return {
        title: '开眼精选',
        link: 'https://www.kaiyanapp.com/',
        description: '开眼每日精选',
        item: items,
    };
}
