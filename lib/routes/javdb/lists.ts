import type { Route } from '@/types';

import utils from './utils';

export const route: Route = {
    path: '/lists/:id/:filter?/:sort?',
    categories: ['multimedia'],
    example: '/javdb/lists/2GPgB',
    parameters: {
        id: '编号，可在清单页 URL 中找到',
        filter: '过滤，见下表，默认为 `全部`，需要占位时可设置为 `none`',
        sort: '排序，见下表，默认为 `加入时间排序`',
    },
    radar: [
        {
            source: ['javdb.com/'],
            target: '',
        },
    ],
    name: '清单',
    maintainers: ['dddepg'],
    handler,
    url: 'javdb.com/',
    description: `过滤

| 全部 | 占位 | 可播放   | 單體作品 | 含磁链   | 含字幕 | 預覽圖  |
| ---- | ---- | -------- | -------- | -------- | ------ | ------- |
|      | none | playable | single   | download | cnsub  | preview |

排序

| 加入时间排序 | 发布时间排序 |
| ------------ | ------------ |
| 0            | 1            |`,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const filter = ctx.req.param('filter') ?? '';
    const sort = ctx.req.param('sort') ?? '0';

    const currentUrl = `/lists/${id}?lst=${sort}${filter && filter !== 'none' ? `&f=${filter}` : ''}`;

    const filters = {
        '': '',
        none: '',
        playable: '可播放',
        single: '單體作品',
        download: '含磁链',
        cnsub: '含字幕',
        preview: '預覽圖',
    };

    const sortOptions = {
        0: '加入时间排序',
        1: '发布时间排序',
    };

    const title = `JavDB${filters[filter] === '' ? '' : ` - ${filters[filter]}`} ${sortOptions[sort]}`;

    return await utils.ProcessItems(ctx, currentUrl, title);
}
