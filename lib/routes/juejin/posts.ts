import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import util from './utils';

export const route: Route = {
    path: '/posts/:id/:perPage?',
    categories: ['programming'],
    example: '/juejin/posts/3051900006845944/20',
    parameters: {
        id: '用户 id, 可在用户页 URL 中找到',
        perPage: '文章数量 perPage (默认20,会取整为10的倍数)',
    },
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
            source: ['juejin.cn/user/:id', 'juejin.cn/user/:id/posts'],
            target: '/posts/:id/20',
        },
    ],
    name: '用户文章',
    maintainers: ['Maecenas', 'nsnans'],
    handler,
};

async function handler(ctx) {
    const { id, perPage = 20 } = ctx.req.param();

    // 合并后的数据
    const data = await fetchDataWithCursors(id, perPage);

    let username: string = '';
    if (data && data?.length) {
        username = data[0] && data[0].author_user_info && data[0].author_user_info.user_name;
    }

    const resultItems = await util.ProcessFeed(data, cache);

    return {
        title: `掘金用户文章-${username}`,
        link: `https://juejin.cn/user/${id}/posts`,
        description: `掘金用户文章-${username}`,
        item: resultItems,
    };
}

async function fetchDataWithCursors(id, perPage) {
    // 小于0，取1
    perPage = perPage <= 0 ? 1 : perPage;
    // 取整
    let num = Math.ceil(perPage / 10) * 10;
    // 减去10，为应得文章数量
    num -= 10;
    const nums: number[] = [];
    for (let i = 0; i <= num; i += 10) {
        nums.push(i);
    }

    // cursor是0，获取10条，是10，获取20条
    const promises = nums.map(async (cursor) => {
        const response = await got({
            method: 'post',
            url: 'https://api.juejin.cn/content_api/v1/article/query_list',
            json: {
                user_id: id,
                sort_type: 2,
                cursor: cursor + '',
            },
        });

        return response.data.data; // 返回每次请求的数据部分
    });

    const dataArray = await Promise.all(promises); // 等待所有请求完成

    // 将所有数据合并
    // 使用for循环将数组合并为一个新数组
    let mergedData: any[] = [];
    for (const arr of dataArray) {
        mergedData = [...mergedData, ...arr];
    }

    return mergedData;
}
