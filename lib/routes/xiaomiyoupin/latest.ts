import pMap from 'p-map';

import { renderNewProduct } from '@/routes/mi/templates/newproduct';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import type { NewProductDetailItem, NewProductListItem } from './types';
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

const getDataItems = (list: NewProductListItem[]): Promise<DataItem[]> =>
    pMap(
        list,
        (listItem) =>
            cache.tryGet(`xiaomiyoupin:product:dataitem:${utils.getNewProductId(listItem)}`, async () => {
                const detailItem = await utils.getNewProductItem(listItem);
                return getDataItem(listItem, detailItem);
            }),
        { concurrency: 6 }
    );

const getDataItem = (listItem: NewProductListItem, detailItem: NewProductDetailItem): DataItem => {
    const releaseTime = utils.isCommonListItem(listItem) ? listItem.value.goods.fist_release_time : undefined;
    return {
        title: utils.isCommonListItem(listItem) ? listItem.value.goods.name : listItem.new_product_name,
        description: renderNewProduct(utils.toNewProduct(listItem, detailItem)),
        link: `https://m.xiaomiyoupin.com/detail?gid=${utils.getNewProductId(listItem)}`,
        image: utils.isCommonListItem(listItem) ? listItem.value.goods.img_square : listItem.picture_url,
        pubDate: releaseTime ? parseDate(releaseTime, 'X') : undefined,
        language: 'zh-CN',
    };
};

async function handler(): Promise<Data> {
    const { list, jumpUrl } = await utils.getNewProductList();
    const items = await getDataItems(list);

    return {
        title: '小米有品上新',
        link: jumpUrl,
        item: items,
        allowEmpty: true,
        image: 'https://cnbj1.fds.api.xiaomi.com/mijia-m/trade_common/yp_logo.png',
        language: 'zh-CN',
    };
}
