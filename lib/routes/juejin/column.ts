import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import util from './utils';

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
    const detail = await got({
        method: 'get',
        url: `https://api.juejin.cn/content_api/v1/column/detail?column_id=${id}`,
    });
    const response = await got({
        method: 'post',
        url: 'https://api.juejin.cn/content_api/v1/column/articles_cursor',
        json: {
            column_id: id,
            limit: 20,
            cursor: '0',
            sort: 0,
        },
    });
    const { data } = response.data;
    const detailData = detail.data.data;
    const columnName = detailData && detailData.column_version && detailData.column_version.title;
    const resultItems = await util.ProcessFeed(data, cache);

    return {
        title: `掘金专栏-${columnName}`,
        link: `https://juejin.cn/column/${id}`,
        description: `掘金专栏-${columnName}`,
        item: resultItems,
    };
}
