import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
export const route: Route = {
    path: '/zcc',
    categories: ['university'],
    example: '/nju/zcc',
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
            source: ['zcc.nju.edu.cn/tzgg/gyfytdglk/index.html', 'zcc.nju.edu.cn/tzgg/index.html', 'zcc.nju.edu.cn/'],
        },
    ],
    name: '资产管理处',
    maintainers: ['ret-1'],
    handler,
    url: 'zcc.nju.edu.cn/tzgg/gyfytdglk/index.html',
};

async function handler() {
    const category_dict = {
        ggtz: '公告通知',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async () => {
            const response = await got(`https://zcc.nju.edu.cn/sy/tzzhxx/index.html`);

            const data = response.data;
            const $ = load(data);
            let script = $('ul.clearfix').find('script');
            script = script['1'].children[0].data;

            const start = script.indexOf('[');
            const end = script.lastIndexOf(']');
            const t = JSON.parse(script.substring(start, end + 1));

            // only read first page
            return t[0].infolist.map((item) => ({
                title: item.title,
                description: item.summary,
                link: item.url,
                author: item.username,
                pubDate: parseDate(item.releasetime, 'x'),
            }));
        })
    );

    return {
        title: '资产管理处-公告通知',
        link: 'https://zcc.nju.edu.cn/sy/tzzhxx/index.html',
        item: items[0],
    };
}
