import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/admission',
    categories: ['university'],
    example: '/nju/admission',
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
            source: ['admission.nju.edu.cn/tzgg/index.html', 'admission.nju.edu.cn/tzgg', 'admission.nju.edu.cn/'],
        },
    ],
    name: '本科迎新',
    maintainers: ['ret-1'],
    handler,
    url: 'admission.nju.edu.cn/tzgg/index.html',
};

async function handler() {
    const category_dict = {
        tzgg: '通知公告',
    };

    const items = await Promise.all(
        Object.keys(category_dict).map(async () => {
            const response = await got(`https://admission.nju.edu.cn/tzgg`);

            const data = response.data;
            const $ = load(data);
            let script = $('ul').find('script');
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
        title: '本科迎新-通知公告',
        link: 'https://admission.nju.edu.cn/tzgg',
        item: items[0],
    };
}
