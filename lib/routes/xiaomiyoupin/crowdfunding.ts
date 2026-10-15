import type { Route } from '@/types';
import got from '@/utils/got';

import { renderGoods } from './templates/goods';
import { parseGoodsDate } from './utils';

const baseUrl = 'https://m.xiaomiyoupin.com';
export const route: Route = {
    path: '/crowdfunding',
    categories: ['shopping'],
    example: '/xiaomiyoupin/crowdfunding',
    parameters: {},
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
            source: ['xiaomiyoupin.com/'],
        },
    ],
    name: '众筹',
    maintainers: ['bigfei'],
    handler,
    url: 'xiaomiyoupin.com/',
};

async function handler() {
    const resp = await got('https://home.mi.com/lasagne/page/5');
    const siteUrl = resp.data.redirect.location;

    const urlParams = new URL(siteUrl).searchParams;
    const pageid = urlParams.get('pageid');
    const sign = urlParams.get('sign');

    // 1. fetchPageData
    const pageData = await got(`${baseUrl}/mtop/navi/venue/page?page_id=${pageid}&pdl=jianyu&sign=${sign}`, {
        headers: {
            accept: '*/*',
        },
    });
    const crowdfundingFloor = pageData.data.data.floors.find((floor) => floor.module_key === 'crowding');
    const queryList = crowdfundingFloor.query_list;

    // 2. fetchFloorDetailData
    const floorDetailData = await got.post(`${baseUrl}/mtop/navi/venue/batch?page_id=${pageid}&pdl=jianyu&sign=${sign}`, {
        json: {
            query_list: queryList,
        },
    });

    const goodsList = floorDetailData.data.data.result_list[0].list;
    const items = goodsList.map((e) => {
        const goods = e.value.goods;
        return {
            title: goods.name,
            guid: `xiaomiyoupin:${goods.gid}`,
            description: renderGoods(goods),
            link: goods.jump_url,
            pubDate: parseGoodsDate(goods.fist_release_time)?.toUTCString(),
        };
    });
    return {
        title: '小米有品众筹',
        link: siteUrl,
        description: '小米有品众筹',
        item: items,
    };
}
