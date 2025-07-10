import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const categories = {
    'zh-cn': {
        'news-all': {
            id: '255',
            title: '最新',
        },
        news: {
            id: '256',
            title: '新闻',
        },
        notice: {
            id: '257',
            title: '公告',
        },
        activity: {
            id: '258',
            title: '活动',
        },
        link: 'https://sr.mihoyo.com/news',
    },
    'zh-tw': {
        'news-all': {
            id: '248',
            title: '最新',
        },
        news: {
            id: '249',
            title: '資訊',
        },
        notice: {
            id: '250',
            title: '公告',
        },
        activity: {
            id: '251',
            title: '活動',
        },
        link: 'https://hsr.hoyoverse.com/zh-tw/news',
    },
};

export const route: Route = {
    path: '/sr/:location?/:category?',
    categories: ['game'],
    example: '/mihoyo/sr',
    parameters: { location: '区域，可选 `zh-cn`（国服，简中）或 `zh-tw`（国际服，繁中）', category: '分类，见下表，默认为最新' },
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
            source: ['sr.mihoyo.com/news'],
            target: '/sr',
        },
    ],
    name: '崩坏：星穹铁道',
    maintainers: ['shinanory'],
    handler,
    url: 'sr.mihoyo.com/news',
    description: `#### 新闻 {#mi-ha-you-beng-huai-xing-qiong-tie-dao-xin-wen}

| 最新     | 新闻 | 公告   | 活动     |
| -------- | ---- | ------ | -------- |
| news-all | news | notice | activity |`,
};

async function handler(ctx) {
    // location 地区 category 类型
    const { location = 'zh-cn', category = 'news-all' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;
    const url =
        location === 'zh-cn'
            ? `https://api-takumi-static.mihoyo.com/content_v2_user/app/1963de8dc19e461c/getContentList?iPage=1&iPageSize=${limit}&sLangKey=zh-cn&isPreview=0&iChanId=${categories[location][category].id}`
            : `https://api-os-takumi-static.hoyoverse.com/content_v2_user/app/113fe6d3b4514cdd/getContentList?iPage=1&iPageSize=${limit}&sLangKey=${location}&isPreview=0&iChanId=${categories[location][category].id}`;

    const response = await got(url);
    const list = response.data.data.list;
    const items = list.map((item) => ({
        title: item.sTitle,
        description: item.sContent,
        link: `${categories[location].link}/${item.iInfoId}`,
        pubDate: parseDate(item.dtStartTime),
        category: item.sCategoryName,
    }));

    return {
        title: `${categories[location][category].title}-崩坏：星穹铁道`,
        link: url,
        item: items,
    };
}
