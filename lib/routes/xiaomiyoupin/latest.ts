import { renderNewProduct } from '@/routes/mi/templates/newproduct';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import type { GoodsDetailItem, NewProductBatchListItem } from './types';
import utils from './utils';

export const route: Route = {
    path: '/latest',
    categories: ['shopping'],
    example: '/xiaomiyoupin/latest',
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
    name: '上新',
    maintainers: ['xyqfer', 'DIYgod', 'bigfei', 'nuomi1'],
    handler,
    url: 'xiaomiyoupin.com/',
    view: ViewType.Notifications,
};

const getDataItems = (list: NewProductBatchListItem[]): Promise<DataItem[]> =>
    Promise.all(
        list.map((listItem) =>
            cache.tryGet(`xiaomiyoupin:product:dataitem:${utils.getNewProductGid(listItem)}`, async () => {
                const detailItem = await utils.getNewProductItem(listItem);
                return getDataItem(listItem, detailItem);
            })
        )
    );

const getDataItem = (listItem: NewProductBatchListItem, detailItem: GoodsDetailItem): DataItem => {
    const pubDate = utils.getNewProductFirstReleaseTime(listItem);
    return {
        title: utils.getNewProductName(listItem),
        description: renderNewProduct(utils.toNewProduct(listItem, detailItem)),
        link: `https://m.xiaomiyoupin.com/detail?gid=${utils.getNewProductGid(listItem)}`,
        image: utils.getNewProductImage(listItem),
        pubDate: pubDate ? parseDate(pubDate, 'X') : undefined,
        language: 'zh-CN',
    };
};

async function handler(): Promise<Data> {
    const list = await utils.getNewProductList();
    const items = await getDataItems(list);

    return {
        title: '小米有品上新',
        link: 'https://www.xiaomiyoupin.com/',
        item: items,
        image: 'https://cnbj1.fds.api.xiaomi.com/mijia-m/trade_common/yp_logo.png',
        language: 'zh-CN',
    };
}
