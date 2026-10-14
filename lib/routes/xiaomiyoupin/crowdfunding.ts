import { renderCrowdfunding } from '@/routes/mi/templates/crowdfunding';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import type { GoodsDetailItem, GoodsListItem } from './types';
import utils from './utils';

export const route: Route = {
    path: '/crowdfunding',
    categories: ['shopping'],
    example: '/xiaomiyoupin/crowdfunding',
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
    maintainers: ['bigfei', 'nuomi1'],
    handler,
    url: 'xiaomiyoupin.com/',
    view: ViewType.Notifications,
};

const getDataItems = (list: GoodsListItem[]): Promise<DataItem[]> =>
    Promise.all(
        list.map((listItem) =>
            cache.tryGet(`xiaomiyoupin:crowdfunding:dataitem:${listItem.gid}`, async () => {
                const detailItem = await utils.getCrowdfundingItem(listItem);
                return getDataItem(listItem, detailItem);
            })
        )
    );

const getDataItem = (listItem: GoodsListItem, detailItem: GoodsDetailItem): DataItem => ({
    title: listItem.name,
    description: renderCrowdfunding(utils.toCrowdfunding(listItem, detailItem)),
    link: listItem.jumpUrl,
    image: listItem.image,
    pubDate: parseDate(detailItem.crowdFunding.startTime, 'X'),
    language: 'zh-CN',
});

async function handler(): Promise<Data> {
    const list = await utils.getCrowdfundingList();
    const items = await getDataItems(list);

    return {
        title: '小米有品众筹',
        link: 'https://www.xiaomiyoupin.com/',
        item: items,
        image: 'https://cnbj1.fds.api.xiaomi.com/mijia-m/trade_common/yp_logo.png',
        language: 'zh-CN',
    };
}
