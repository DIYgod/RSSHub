import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseList, ProcessFeed } from './utils';

export const route: Route = {
    path: '/column/:id',
    categories: ['programming'],
    example: '/juejin/column/6960559453037199391',
    parameters: { id: '专栏 id, 可在专栏页 URL 中找到' },
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
            source: ['juejin.cn/column/:id'],
        },
    ],
    name: '专栏',
    maintainers: ['xiangzy1'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const columnDetail = await ofetch(`https://api.juejin.cn/content_api/v1/column/detail?column_id=${id}`);
    const response = await ofetch('https://api.juejin.cn/content_api/v1/column/articles_cursor', {
        method: 'POST',
        body: {
            column_id: id,
            cursor: '0',
            limit: 20,
            sort: 0,
        },
    });
    const detailData = columnDetail.data;
    const list = parseList(response.data);
    const resultItems = await ProcessFeed(list);

    return {
        title: `${detailData.column_version.title} - ${detailData.author.user_name}的专栏 - 掘金`,
        link: `https://juejin.cn/column/${id}`,
        description: detailData.column_version.description,
        image: columnDetail.data.column_version.cover,
        item: resultItems,
    };
}
