import pMap from 'p-map';

import { renderCrowdfunding } from '@/routes/mi/templates/crowdfunding';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import type { CrowdfundingBatchListItem, GoodsDetailItem } from './types';
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

const getDataItems = (list: CrowdfundingBatchListItem[]): Promise<DataItem[]> =>
    pMap(
        list,
        (listItem) =>
            cache.tryGet(`xiaomiyoupin:crowdfunding:dataitem:${utils.getCrowdfundingGid(listItem)}`, async () => {
                const detailItem = await utils.getCrowdfundingItem(listItem);
                return getDataItem(listItem, detailItem);
            }),
        { concurrency: 6 }
    );

const getDataItem = (listItem: CrowdfundingBatchListItem, detailItem: GoodsDetailItem): DataItem => ({
    title: utils.getCrowdfundingName(listItem),
    description: renderCrowdfunding(utils.toCrowdfunding(listItem, detailItem)),
    link: `https://m.xiaomiyoupin.com/detail?gid=${utils.getCrowdfundingGid(listItem)}`,
    image: utils.getCrowdfundingImage(listItem),
    pubDate: parseDate(detailItem.crowdFunding.startTime, 'X'),
    language: 'zh-CN',
});

async function handler(): Promise<Data> {
    const { list, jumpUrl } = await utils.getCrowdfundingList();
    const items = await getDataItems(list);

    return {
        title: '小米有品众筹',
        link: jumpUrl,
        item: items,
        image: 'https://cnbj1.fds.api.xiaomi.com/mijia-m/trade_common/yp_logo.png',
        language: 'zh-CN',
    };
}
