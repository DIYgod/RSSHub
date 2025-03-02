import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

const rootURL = 'https://scai.swjtu.edu.cn';

export const route: Route = {
    path: '/scai/:type',
    categories: ['university'],
    example: '/swjtu/scai/bks',
    parameters: { type: '通知类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['scai.swjtu.edu.cn/'],
        },
    ],
    name: '计算机与人工智能学院',
    description: `
| 分区              | 参数         |
| ----------------- | ----------- |
| 本科生教育         | bks         |
| 研究生教育         | yjs         |
| 学生工作           | xsgz        |
`,
    maintainers: ['AzureG03', 'SuperJeason'],
    handler,
};

const partition = {
    bks: {
        title: '本科生教育',
        url: `${rootURL}/web/page-module.html?mid=B730BEB095B31840`,
    },
    yjs: {
        title: '研究生教育',
        url: `${rootURL}/web/page-module.html?mid=6A69B0E32021446B`,
    },
    xsgz: {
        title: '学生工作',
        url: `${rootURL}/web/page-module.html?mid=F3D3909EB1861B5D`,
    },
};

const getItem = (item, cache) => {
    const title = item.find('a').text();
    const link = `${rootURL}${item.find('a').attr('href').slice(2)}`;

    return cache.tryGet(link, async () => {
        const res = await ofetch(link);
        const $ = load(res);

        let dateText = $('div.news-info span:nth-of-type(2)').text();
        // 转教务通知时的时间获取方法
        if (!dateText) {
            dateText = $('div.news-top-bar span:nth-of-type(1)').text();
        }
        // 'date' may be undefined. and 'parseDate' will return current time.
        const date = dateText.match(/\d{4}(-|\/|.)\d{1,2}\1\d{1,2}/)?.[0];
        const pubDate = parseDate(date);
        const description = $('div.content-main').html();

        return {
            title,
            pubDate,
            link,
            description,
        };
    });
};

async function handler(ctx) {
    const { type } = ctx.req.param();
    const url = partition[type].url;
    const res = await ofetch(url);

    const $ = load(res);
    const $list = $('div.list-top-item, div.item-wrapper');

    const items = await Promise.all(
        $list.toArray().map((i) => {
            const $item = $(i);
            return getItem($item, cache);
        })
    );

    return {
        title: `西南交大计院-${partition[type].title}`,
        link: url,
        item: items,
        allowEmpty: true,
    };
}
