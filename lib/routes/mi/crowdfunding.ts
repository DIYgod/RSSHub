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

const getDetails = async (list: Map<number, CrowdfundingItem>): Promise<Map<number, CrowdfundingDetailInfo>> => {
    const details = await Promise.all(list.values().map((item) => utils.getCrowdfundingItem(item)));
    return new Map(details.map((detail) => [detail.project_id, detail]));
};

const getDataItem = (listItem: CrowdfundingItem, detail: CrowdfundingDetailInfo) =>
    ({
        title: listItem.product_name,
        description: utils.renderCrowdfunding(listItem, detail),
        link: `https://m.mi.com/crowdfunding/proddetail/${listItem.project_id}`,
        image: listItem.img_url,
        pubDate: parseDate(detail.start_time, 'X'),
        language: 'zh-CN',
    }) as DataItem;

async function handler() {
    const list = await utils.getCrowdfundingList();
    const details = await getDetails(list);

    const items: DataItem[] = list
        .values()
        .toArray()
        .toSorted((a, b) => b.project_id - a.project_id)
        .map((item) => {
            const detail = details.get(item.project_id);
            if (!detail) {
                throw new Error(`Details not found for project ${item.project_id}`);
            }
            return getDataItem(item, detail);
        });

    return {
        title: '小米众筹',
        link: 'https://m.mi.com/crowdfunding/home',
        item: items,
        image: 'https://m.mi.com/static/img/icons/apple-touch-icon-152x152.png',
        language: 'zh-CN',
    } as Data;
}
