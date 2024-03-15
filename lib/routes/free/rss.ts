import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['free.com.tw/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['cnkmmk'],
    handler,
    url: 'free.com.tw/',
};

async function handler() {
    const url = 'https://free.com.tw/';
    const response = await got(`${url}/wp-json/wp/v2/posts`);
    const list = response.data;
    return {
        title: '免費資源網路社群',
        link: url,
        description: '免費資源網路社群 - 全部文章',
        item: list.map((item) => ({
            title: item.title.rendered,
            link: item.link,
            pubDate: parseDate(item.date_gmt),
            description: item.content.rendered,
        })),
    };
}
