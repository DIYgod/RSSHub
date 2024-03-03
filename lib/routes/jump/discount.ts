// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';

const discountUrl = 'https://switch.jumpvg.com/jump/discount/find4Discount/5/v2';
// const detailUrl = 'https://switch.jumpvg.com/jump/game/detail';

// 平台对应参数
const platformObject = {
    switch: 1,
    steam: 4,
    ps4: 51,
    ps5: 52,
};

// 各个平台分类参数
const filterObject = {
    switch: {
        jx: 16,
        all: 17,
        sd: 18,
    },
    steam: {
        jx: 26,
        all: 27,
        dl: 28,
        sd: 29,
    },
    ps4: {
        jx: 19,
        all: 20,
        sd: 21,
        vip: 22,
    },
    ps5: {
        all: 23,
        sd: 24,
        vip: 25,
    },
};

// 分类对应名
const filterName = {
    jx: '精选',
    sd: '史低',
    all: '全部',
    vip: '会员',
    dl: '独立',
};

const getDiscountNum = async (platform) => {
    const response = await got.get(`https://switch.jumpvg.com/jump/platform/order/v2?needCount=1&needFilter=1&version=3`);
    const data = response.data.data;
    let totalNum = 0;
    for (const index in data) {
        if (data[index].platformAlias.toLocaleLowerCase() === platform.toLocaleLowerCase()) {
            totalNum = data[index].gameNum;
            break;
        }
    }
    return totalNum;
};

const getSinglePageDiscountItem = async (countries, offset, platform, termsId) => {
    const response = await got.get(`${discountUrl}?countries=${countries}&offset=${offset}&platform=${platform}&size=10&termsId=${termsId}&version=3`);
    return response.data.data;
};

// 防止触发反爬
const getAllPageDiscountItem = async (countries, platform, termsId, totalNum) => {
    let allDiscountItem = [];
    for (let idx = 0; idx <= Math.round(totalNum / 10); idx++) {
        // eslint-disable-next-line no-await-in-loop
        const itemList = await getSinglePageDiscountItem(countries, idx * 10, platform, termsId);
        allDiscountItem = [...allDiscountItem, ...itemList];
    }
    return allDiscountItem;
};

// const getGameDetail = (item, caches) => caches.tryGet(`${item.platform}-${item.oldGameId}`, async () => {
//     const response = await got.get(`${detailUrl}?clickFrom=-1&id=${item.oldGameId}&platform=${item.platform}&version=3`);
//     return response.data.data;
// });

//  依次获取详情
// const seqGetGameDetail = async (allDiscountItem, ctx) => {
//     for (const idx in allDiscountItem) {
//         logger.info(idx);
//         // eslint-disable-next-line no-await-in-loop
//         const detail = await getGameDetail(allDiscountItem[idx], cache);
//         allDiscountItem[idx].detail = detail;
//         logger.info(detail);
//         };
// };

export default async (ctx) => {
    const platform = ctx.req.param('platform');
    const filter = ctx.req.param('filter') || 'all';
    const countries = ctx.req.param('countries') || '';

    const discountNum = await getDiscountNum(platform);
    const allDiscountItem = await getAllPageDiscountItem(countries, platformObject[platform.toLocaleLowerCase()], filterObject[platform.toLocaleLowerCase()][filter], discountNum);

    // 并发极易触发反爬，此处可选是否获取detail,detail也只能顺序获取--反爬严格，放弃
    // if (needDeatail) {
    //     await seqGetGameDetail(allDiscountItem, ctx);
    // }

    ctx.set('data', {
        title: `jump 折扣-${platform}-${filterName[filter]}${countries ? `-${countries}` : ''}`,
        link: 'https://jumpvg.com/',
        description: 'jump 发现游戏',
        item: allDiscountItem.map((item) => ({
            title: `${item.name}-${item.cutOff}%-￥${item.price}`,
            description: art(path.resolve(__dirname, './templates/discount.art'), { item }),
            link: item.banner,
            guid: `${platform}-${item.oldGameId}-${item.cutOff}`, // 平台-打折id-打折率
        })),
    });
};
