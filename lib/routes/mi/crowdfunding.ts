import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';

import type { CrowdfundingDetailInfo, CrowdfundingItem } from './types';
import utils from './utils';

export const route: Route = {
    path: '/crowdfunding',
    categories: ['shopping'],
    example: '/mi/crowdfunding',
    name: '小米众筹',
    maintainers: ['DIYgod', 'nuomi1'],
    handler,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['m.mi.com/crowdfunding/home'],
            target: '/crowdfunding',
        },
    ],
    view: ViewType.Notifications,
};

const getDetails = (list: CrowdfundingItem[]): Promise<Array<{ listItem: CrowdfundingItem; detail: CrowdfundingDetailInfo }>> =>
    Promise.all(
        list.map(async (listItem) => ({
            listItem,
            detail: await utils.getCrowdfundingItem(listItem),
        }))
    );

const getDataItem = (listItem: CrowdfundingItem, detail: CrowdfundingDetailInfo): DataItem => ({
    title: listItem.product_name,
    description: utils.renderCrowdfunding(listItem, detail),
    link: `https://m.mi.com/crowdfunding/proddetail/${listItem.project_id}`,
    image: listItem.img_url,
    pubDate: parseDate(detail.start_time, 'X'),
    language: 'zh-CN',
});

async function handler(): Promise<Data> {
    const list = await utils.getCrowdfundingList();
    const details = await getDetails(list);

    const items: DataItem[] = details.map(({ listItem, detail }) => getDataItem(listItem, detail));

    return {
        title: '小米众筹',
        link: 'https://m.mi.com/crowdfunding/home',
        item: items,
        image: 'https://m.mi.com/static/img/icons/apple-touch-icon-152x152.png',
        language: 'zh-CN',
    };
}
