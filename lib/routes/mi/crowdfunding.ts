import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';

import type { CrowdfundingDetailInfo, CrowdfundingList } from './types';
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

const getDetails = async (list: CrowdfundingList[]) => {
    const result: Promise<CrowdfundingDetailInfo>[] = list.flatMap((section) => section.items.map((item) => utils.getCrowdfundingItem(item)));
    return await Promise.all(result);
};

const getDataItem = (item: CrowdfundingDetailInfo) =>
    ({
        title: item.project_name,
        description: utils.renderCrowdfunding(item),
        link: `https://m.mi.com/crowdfunding/proddetail/${item.project_id}`,
        image: item.big_image,
        language: 'zh-cn',
    }) as DataItem;

async function handler() {
    const list = await utils.getCrowdfundingList();
    const details = await getDetails(list);

    const items: DataItem[] = details.map((item) => getDataItem(item));

    return {
        title: '小米众筹',
        link: 'https://m.mi.com/crowdfunding/home',
        item: items,
        allowEmpty: true,
        image: 'https://m.mi.com/static/img/icons/apple-touch-icon-152x152.png',
        language: 'zh-cn',
    } as Data;
}
