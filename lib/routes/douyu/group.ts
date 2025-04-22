import { Route } from '@/types';

import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/group/:id/:sort?',
    categories: ['bbs'],
    example: '/douyu/group/1011',
    parameters: { id: '鱼吧 id，可在鱼吧页 URL 中找到', sort: '排序方式，见下表，默认为发布时间排序' },
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
            source: ['yuba.douyu.com/group/:id', 'yuba.douyu.com/group/newself/:id', 'yuba.douyu.com/group/newall/:id', 'yuba.douyu.com/'],
            target: '/group/:id',
        },
    ],
    name: '鱼吧帖子',
    maintainers: ['nczitzk'],
    handler,
    description: `| 回复时间排序 | 发布时间排序 |
| ------------ | ------------ |
| 1            | 2            |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const sort = ctx.req.param('sort') ?? '2';

    const rootUrl = 'https://yuba.douyu.com';
    const detailUrl = `${rootUrl}/wbapi/web/group/head?group_id=${id}`;
    const apiUrl = `${rootUrl}/wbapi/web/group/postlist?group_id=${id}&page=1&sort=${sort}`;
    const currentUrl = `${rootUrl}/group/${sort === '1' ? 'newall' : 'newself'}/${id}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const detailResponse = await got({
        method: 'get',
        url: detailUrl,
    });

    const items = response.data.data.map((item) => ({
        title: item.title,
        link: `${rootUrl}/p/${item.post_id}`,
        pubDate: timezone(parseDate(item.created_at_std), +8),
        description: art(path.join(__dirname, 'templates/description.art'), {
            content: item.describe,
            images: item.imglist.map((i) => ({
                size: i.size,
                url: i.url,
            })),
        }),
    }));

    return {
        title: `斗鱼鱼吧 - ${detailResponse.data.data.group_name}`,
        link: currentUrl,
        item: items,
        description: detailResponse.data.data.describe,
    };
}
