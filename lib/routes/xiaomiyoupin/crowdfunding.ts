// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';

const base_url = 'https://m.xiaomiyoupin.com';
export default async (ctx) => {
    const resp = await got('https://home.mi.com/lasagne/page/5');
    const site_url = resp.data.redirect.location;

    const urlParams = new URLSearchParams(site_url);
    const pageid = urlParams.get('pageid');
    const sign = urlParams.get('sign');

    // 1. fetchPageData
    const pageData = await got(`${base_url}/mtop/navi/venue/page?page_id=${pageid}&pdl=jianyu&sign=${sign}`);
    const crowd_funding_floor = pageData.data.data.floors.find((floor) => floor.module_key === 'crowding');
    const query_list = crowd_funding_floor.query_list;

    // 2. fetchFloorDetailData
    const floor_detail_data = await got.post(`${base_url}/mtop/navi/venue/batch?page_id=${pageid}&pdl=jianyu&sign=${sign}`, {
        json: {
            query_list,
        },
    });

    const goodsList = floor_detail_data.data.data.result_list[0].list;
    const items = goodsList.map((e) => {
        const goods = e.value.goods;
        return {
            title: goods.name,
            guid: `xiaomiyoupin:${goods.gid}`,
            description: art(path.join(__dirname, 'templates/goods.art'), goods),
            link: goods.jump_url,
            pubDate: new Date(goods.fist_release_time * 1000).toUTCString(),
        };
    });
    ctx.set('data', {
        title: '小米有品众筹',
        link: site_url,
        description: '小米有品众筹',
        item: items,
    });
};
