import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/mall/ip/:id',
    categories: ['social-media'],
    example: '/bilibili/mall/ip/0_3000294',
    parameters: { id: '作品 id, 可在作品列表页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '会员购作品',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const detail = await got({
        method: 'get',
        url: `https://mall.bilibili.com/mall-c-search/ipright/detail?type=ip&id=${id}`,
        headers: {
            Referer: `https://mall.bilibili.com/ip.html?noTitleBar=1&ip=${id}&from=detail`,
        },
    });
    const ipInfo = detail.data.data;
    if (!ipInfo?.name) {
        throw new NotFoundError(`Bilibili merchandise IP ${id} was not found`);
    }

    const response = await got({
        method: 'get',
        url: `https://mall.bilibili.com/mall-c-search/ipright/newitems?type=ip&id=${id}`,
        headers: {
            Referer: `https://mall.bilibili.com/ip.html?noTitleBar=1&ip=${id}&from=detail`,
        },
    });

    const data = response.data.data;
    if (response.data.code !== 0) {
        throw new Error(`Bilibili merchandise request failed: code = ${response.data.code}, message = ${response.data.message}`);
    }
    if (!Array.isArray(data) || data.length === 0) {
        throw new NotFoundError(`Bilibili merchandise IP ${id} has no newly released items; check its official merchandise page`);
    }

    return {
        title: `${ipInfo.name} - 会员购`,
        description: ipInfo.intro,
        link: `https://mall.bilibili.com/list.html?ip=${id}`,
        item: data.map((item) => ({
            title: item.name,
            description: `${item.name}<br>￥${item.price}<br><img src="${item.itemsImg}">`,
            link: item.jumpUrlH5,
        })),
    };
}
