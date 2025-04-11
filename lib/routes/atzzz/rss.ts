import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/atzzz',
    radar: [
        {
            source: ['atzzz.com/'],
        },
    ],
    name: '最新文章',
    maintainers: ['iPme'],
    handler,
    url: 'atzzz.com/',
};

async function handler() {
    const url = 'https://atzzz.com';
    const response = await got(`${url}/wp-json/wp/v2/posts`);
    const list = response.data;
    return {
        title: 'ATzzz',
        link: url,
        description: 'ATzzz News',
        item: list.map((item) => ({
            title: item.title.rendered,
            link: item.link,
            pubDate: parseDate(item.date_gmt),
            description: item.content.rendered,
        })),
    };
}
