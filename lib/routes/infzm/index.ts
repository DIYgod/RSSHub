import type { Data, DataItem, Route } from '@/types';
import type { ContentsResponse } from './types';
import got from '@/utils/got';
import { fetchArticles } from './utils';

export const route: Route = {
    path: '/:id',
    parameters: { id: '南方周末频道 id, 可在该频道的 URL 中找到（即 https://www.infzm.com/contents?term_id=:id)' },
    categories: ['traditional-media'],
    example: '/infzm/1',
    radar: [
        {
            source: ['infzm.com/contents'],
            target: (_, url) => (url ? `/infzm/${url.match(/contents\?term_id=(\d*)/)?.[1]}` : ''),
        },
    ],
    name: '频道',
    maintainers: ['KarasuShin', 'ranpox', 'xyqfer'],
    handler,
    description: `下面给出部分参考：

| 推荐 | 新闻 | 观点 | 文化 | 人物 | 影像 | 专题 | 生活 | 视频 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    | 7    | 8    | 6    | 5    | 131  |`,
};

export const baseUrl = 'https://www.infzm.com/contents';

async function handler(ctx): Promise<Data> {
    const id = ctx.req.param('id');
    const link = `${baseUrl}?term_id=${id}`;
    const { data } = await got<ContentsResponse>({
        method: 'get',
        url: `${baseUrl}?term_id=${id}&page=1&format=json`,
        headers: {
            Referer: link,
        },
    });

    const resultItem = await fetchArticles(data.data.contents);

    return {
        title: `南方周末-${data.data.current_term.title}`,
        link,
        image: 'https://www.infzm.com/favicon.ico',
        item: resultItem as DataItem[],
    };
}
