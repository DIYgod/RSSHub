import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const categories = {
    'zh-cn': {
        'news-all': {
            id: '273',
            title: '最新',
        },
        news: {
            id: '278',
            title: '新闻',
        },
        notice: {
            id: '279',
            title: '公告',
        },
        activity: {
            id: '280',
            title: '活动',
        },
        title: '绝区零',
        link: 'https://zzz.mihoyo.com/news',
        apiRootUrl: 'https://api-takumi-static.mihoyo.com/content_v2_user/app/706fd13a87294881/getContentList',
    },
    'zh-tw': {
        'news-all': {
            id: '288',
            title: '最新',
        },
        news: {
            id: '295',
            title: '新聞',
        },
        notice: {
            id: '296',
            title: '公告',
        },
        activity: {
            id: '297',
            title: '活動',
        },
        title: '絕區零',
        link: 'https://zenless.hoyoverse.com/zh-tw/news',
        apiRootUrl: 'https://api-os-takumi-static.hoyoverse.com/content_v2_user/app/3e9196a4b9274bd7/getContentList',
    },
};

export const route: Route = {
    path: '/zzz/:location?/:category?',
    categories: ['game'],
    example: '/mihoyo/zzz',
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
            source: ['zzz.mihoyo.com/news'],
            target: '/zzz',
        },
    ],
    name: '绝区零',
    maintainers: ['Yeye-0426'],
    handler,
    url: 'zzz.mihoyo.com/news',
    description: `#### 新闻 {#mi-ha-you-jue-qu-ling-xin-wen}

| 最新     | 新闻 | 公告   | 活动     |
| -------- | ---- | ------ | -------- |
| news-all | news | notice | activity |`,
};

async function handler(ctx) {
    // location 地区 category 类型
    const { location = 'zh-cn', category = 'news-all' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const params = {
        'zh-cn': `iPageSize=${limit}&iPage=1&sLangKey=zh-cn&isPreview=0&iChanId=${categories[location][category].id}`,
        'zh-tw': `iPageSize=${limit}&iPage=1&sLangKey=zh-tw&isPreview=0&iChanId=${categories[location][category].id}`,
    };

    const apiUrl = `${categories[location].apiRootUrl}?${params[location]}`;
    const response = await got(apiUrl);
    const list = response.data.data.list;
    const items = list.map((item) => ({
        title: item.sTitle,
        description: item.sContent,
        link: `${categories[location].link}/${item.iInfoId}`,
        pubDate: timezone(parseDate(item.dtStartTime), +8), // 使用 timezone 工具指定时区 (+8是北京时间)
        category: item.sCategoryName,
    }));

    return {
        title: `${categories[location][category].title}-${categories[location].title}`,
        link: `${categories[location].link}?category=${categories[location][category].id}`,
        item: items,
    };
}
