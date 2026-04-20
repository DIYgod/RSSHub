import type { Route } from '@/types';
import got from '@/utils/got';

import { renderCrowdfunding } from './templates/crowdfunding';

const base_url = 'https://m.xiaomiyoupin.com';

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
    name: '小米有品众筹',
    maintainers: ['bigfei'],
    handler,
    url: 'xiaomiyoupin.com/',
};

async function handler() {
    // 使用 homepage/main/v1005 API，不需要 sign，长期稳定
    const resp = await got('https://m.xiaomiyoupin.com/homepage/main/v1005');

    const floors = resp.data.data.homepage.floors;
    const crowdFloor = floors.find((floor) => floor.module_key === 'crowd_funding');

    if (!crowdFloor || !crowdFloor.data.items) {
        throw new Error('未找到众筹数据');
    }

    const goodsList = crowdFloor.data.items.map((e) => e.item);
    const items = goodsList.map((goods) => {
        return {
            title: goods.name,
            guid: `xiaomiyoupin:${goods.gid}`,
            description: renderCrowdfunding(goods),
            link: goods.jump_url,
            pubDate: goods.start ? new Date(goods.start * 1000).toUTCString() : undefined,
        };
    });

    return {
        title: '小米有品众筹',
        link: `${base_url}/w/crowdfundV3`,
        description: '小米有品众筹',
        item: items,
    };
}
