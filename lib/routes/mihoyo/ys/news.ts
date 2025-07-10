import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const categories = {
    latest: {
        main: {
            id: 719,
            slug: 719,
            title: '最新',
        },
        'zh-tw': {
            id: 395,
            slug: 395,
            title: '最新',
        },
    },
    news: {
        main: {
            id: 720,
            slug: 720,
            title: '新闻',
        },
        'zh-tw': {
            id: 396,
            slug: 396,
            title: '資訊',
        },
    },
    notice: {
        main: {
            id: 721,
            slug: 721,
            title: '公告',
        },
        'zh-tw': {
            id: 397,
            slug: 397,
            title: '公告',
        },
    },
    activity: {
        main: {
            id: 722,
            slug: 722,
            title: '活动',
        },
        'zh-tw': {
            id: 398,
            slug: 398,
            title: '活動',
        },
    },
};

const rootUrls = {
    main: 'https://ys.mihoyo.com',
    'zh-tw': 'https://genshin.hoyoverse.com',
};

const apiRootUrls = {
    main: 'https://api-takumi-static.mihoyo.com',
    'zh-tw': 'https://api-os-takumi-static.hoyoverse.com',
};

const currentUrls = {
    main: '/main/news',
    'zh-tw': '/zh-tw/news',
};

const apiUrls = {
    main: '/content_v2_user/app/16471662a82d418a/getContentList',
    'zh-tw': '/content_v2_user/app/a1b1f9d3315447cc/getContentList',
};

export const route: Route = {
    path: '/ys/:location?/:category?',
    categories: ['game'],
    example: '/mihoyo/ys',
    parameters: { location: '区域，可选 `main`（简中）或 `zh-tw`（繁中）', category: '分类，见下表，默认为最新' },
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
            source: ['genshin.hoyoverse.com/:location/news'],
            target: '/ys/:location',
        },
    ],
    name: '原神',
    maintainers: ['nczitzk'],
    handler,
    description: `#### 新闻 {#mi-ha-you-yuan-shen-xin-wen}

| 最新   | 新闻 | 公告   | 活动     |
| ------ | ---- | ------ | -------- |
| latest | news | notice | activity |`,
};

async function handler(ctx) {
    const location = ctx.req.param('location') ?? 'main';
    const category = ctx.req.param('category') ?? 'latest';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const params = {
        main: `iPage=1&sLangKey=zh-cn&iChanId=${categories[category][location].id}&iPageSize=${limit}`,
        'zh-tw': `iPage=1&sLangKey=zh-tw&iChanId=${categories[category][location].id}&iPageSize=${limit}`,
    };

    const rootUrl = rootUrls[location];
    const apiRootUrl = apiRootUrls[location];
    const apiUrl = `${apiRootUrl}${apiUrls[location]}?${params[location]}`;
    const currentUrl = `${rootUrl}${currentUrls[location]}/${categories[category][location].slug}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.list;
    const items = list.map((item) => ({
        title: item.sTitle,
        description: item.sContent,
        link: `${rootUrl}${currentUrls[location]}/detail/${item.iInfoId}`,
        pubDate: parseDate(item.dtStartTime),
        category: item.sCategoryName,
    }));

    return {
        title: `原神 - ${categories[category][location].title}`,
        link: currentUrl,
        item: items,
    };
}
