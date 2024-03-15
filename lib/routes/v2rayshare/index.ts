import { Route } from '@/types';
import got from '@/utils/got'; // 自订的 got
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['v2rayshare.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['77taibai'],
    handler,
    url: 'v2rayshare.com/',
};

async function handler() {
    const { data: response } = await got('https://v2rayshare.com/wp-json/wp/v2/posts/?per_page=10');

    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        author: 'V2rayShare',
        category: ['免费节点'],
        pubDate: parseDate(item.date_gmt),
        description: item.content.rendered,
    }));

    return {
        title: 'V2rayShare',
        link: 'https://v2rayshare.com/',
        description: '免费节点分享网站',
        item: items,
    };
}
