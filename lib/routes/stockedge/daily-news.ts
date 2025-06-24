import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { getData, getList } from './utils';

export const route: Route = {
    path: '/daily-updates/news',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/stockedge/daily-updates/news',
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
            source: ['web.stockedge.com/daily-updates/news'],
        },
    ],
    name: 'Daily Updates News',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'web.stockedge.com/daily-updates/news',
};

async function handler() {
    const baseUrl = 'https://web.stockedge.com/daily-updates?section=news';
    const apiPath = 'https://api.stockedge.com/Api/DailyDashboardApi/GetLatestNewsItems';
    const apiInfo = 'https://api.stockedge.com/Api/SecurityDashboardApi/GetSecurityOverview';

    const data = await getData(apiPath);
    const list = getList(data);
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.securityID) {
                    return item;
                }
                const info = await getData(`${apiInfo}/${item.securityID}`);
                item.description = item.description + '<br><br>' + info?.AboutCompanyText;
                return item;
            })
        )
    );

    return {
        title: 'Stock Edge',
        link: baseUrl,
        item: items,
        description: 'Daily Updates on stockedge.com',
        logo: 'https://web.stockedge.com/assets/icon/favicon.png',
        icon: 'https://web.stockedge.com/assets/img/light/icon.png',
        language: 'en-us',
    };
}
