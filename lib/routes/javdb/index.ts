import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/home/:category?/:sort?/:filter?',
    radar: [
        {
            source: ['javdb.com/'],
        },
    ],
    name: '主页',
    example: '/javdb/home',
    parameters: { category: '分类，见下表，默认为 `有碼`', sort: '排序，见下表，默认为 `磁鏈更新排序`', filter: '过滤，见下表，默认为 `可下载`' },
    maintainers: ['nczitzk'],
    handler,
    url: 'javdb.com/',
    description: `分类

| 有碼     | 無碼       | 歐美    |
| -------- | ---------- | ------- |
| censored | uncensored | western |

  排序

| 发布日期排序 | 磁鏈更新排序 |
| ------------ | ------------ |
| 1            | 2            |

  过滤

| 全部 | 可下载 | 含字幕 | 含短評 |
| ---- | ------ | ------ | ------ |
| 0    | 1      | 2      | 3      |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'censored';
    const sort = ctx.req.param('sort') ?? '2';
    const filter = ctx.req.param('filter') ?? '1';

    const currentUrl = `${category === 'censored' ? '' : category}?vft=${filter}&vst=${sort}`;

    const categories = {
        censored: '有碼',
        uncensored: '無碼',
        western: '歐美',
        fc2: 'FC2',
    };

    const filters = {
        0: '',
        1: '可下载',
        2: '含字幕',
        3: '含短評',
    };

    const sorts = {
        1: '发布日期排序',
        2: '磁鏈更新排序',
    };

    const title = `${categories[category]} - JavDB - ${filters[filter] === '' ? '|' : `${filters[filter]} | `}${sorts[sort]}`;

    return await utils.ProcessItems(ctx, currentUrl, title);
}
