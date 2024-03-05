// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const id = ctx.req.param('id');

    const detail = await got({
        method: 'get',
        url: `https://mall.bilibili.com/mall-c-search/ipright/detail?type=ip&id=${id}`,
        headers: {
            Referer: `https://mall.bilibili.com/ip.html?noTitleBar=1&ip=${id}&from=detail`,
        },
    });

    const response = await got({
        method: 'get',
        url: `https://mall.bilibili.com/mall-c-search/ipright/newitems?type=ip&id=${id}`,
        headers: {
            Referer: `https://mall.bilibili.com/ip.html?noTitleBar=1&ip=${id}&from=detail`,
        },
    });

    const data = response.data.data;

    ctx.set('data', {
        title: `${detail.data.data.name} - 会员购`,
        description: detail.data.data.intro,
        link: `https://mall.bilibili.com/list.html?ip=${id}`,
        item: data.map((item) => ({
            title: item.name,
            description: `${item.name}<br>￥${item.price}<br><img src="${item.itemsImg}">`,
            link: item.jumpUrlH5,
        })),
    });
};
