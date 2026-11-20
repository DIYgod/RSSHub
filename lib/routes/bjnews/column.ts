import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { fetchArticle } from './utils';

export const route: Route = {
    path: '/column/:column',
    categories: ['traditional-media'],
    example: '/bjnews/column/204',
    parameters: { column: '栏目ID, 可从手机版网页URL中找到' },
    features: {},
    radar: [
        {
            source: ['m.bjnews.com.cn/column/:column'],
        },
    ],
    name: '分类',
    maintainers: ['dzx-dzx'],
    handler,
    url: 'www.bjnews.com.cn',
};

async function handler(ctx) {
    const columnID = ctx.req.param('column').replace(/\.html$/, '');
    const url = `https://api.bjnews.com.cn/api/v101/news/column_news.php?column_id=${columnID}`;
    const res = await ofetch(url);
    const list = res.data.slice(0, getRouteLimit(ctx, 15)).map((e) => ({
        title: e.row.title,
        guid: e.uuid,
        pubDate: parseDate(e.row.publish_time, 8),
        updated: parseDate(e.row.update_time, 8),
        link: `https://www.bjnews.com.cn/detail/${e.uuid}.html`,
    }));

    const out = await Promise.all(list.map((item) => fetchArticle(item)));
    return {
        title: `新京报 - 栏目 - ${res.data[0].row.column_info[0].column_name}`,
        link: `https://m.bjnews.com.cn/column/${columnID}.html`,
        item: out,
    };
}
