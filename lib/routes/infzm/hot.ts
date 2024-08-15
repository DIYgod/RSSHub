import type { Data, DataItem, Route } from '@/types';
import type { ContentsResponse } from './types';
import got from '@/utils/got';
import { fetchArticles } from './utils';

export const route: Route = {
    path: '/hot',
    parameters: {},
    categories: ['traditional-media'],
    example: '/infzm/hot',
    radar: [
        {
            source: ['infzm.com/'],
        },
    ],
    name: '热门文章',
    maintainers: ['KarasuShin', 'ranpox', 'xyqfer'],
    handler,
};

export const baseUrl = 'https://www.infzm.com/contents';

async function handler(ctx): Promise<Data> {
    const id = ctx.req.param('id');
    const link = `${baseUrl}?term_id=${id}`;
    const { data } = await got<ContentsResponse>({
        method: 'get',
        url: `https://www.infzm.com/hot_contents`,
        headers: {
            Referer: link,
        },
    });

    const resultItem = await fetchArticles(data.data.hot_contents);

    return {
        title: `南方周末-热门文章`,
        link,
        image: 'https://www.infzm.com/favicon.ico',
        item: resultItem as DataItem[],
    };
}
