import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/newest',
    categories: ['other'],
    example: '/wegene/newest',
    parameters: {},
    radar: [{ source: ['www.wegene.com/'] }],
    name: '最近更新',
    maintainers: ['LogicJake'],
    handler,
};

async function handler() {
    const link = 'https://www.wegene.com/';
    const api = 'https://www.wegene.com/contents/ajax/update/get_list/?htmlspecialchars_decode=true&page=1';

    const response = await ofetch(api);
    const data = response.rsm;

    return {
        title: '最近更新-WeGene',
        link,
        item: data.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: parseDate(item.add_time * 1000),
            link: item.url,
        })),
    };
}
