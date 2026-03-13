import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/recommend',
    categories: ['new-media'],
    example: '/iheima/recommend',
    url: 'www.iheima.com',
    name: '推荐',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.iheima.com/?page=1&pagesize=20';

    const response = await got({
        method: 'get',
        url: baseUrl,
        responseType: 'json',
        headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            Referer: 'https://www.iheima.com/',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    const content = JSON.parse(response.body);
    const list = content.contents;

    const items = list.map((item) => ({
        title: item.title,
        link: item.url,
        pubDate: parseDate(item.published),
        description: item.content,
    }));

    return {
        title: '推荐',
        link: baseUrl,
        item: items,
    };
}
