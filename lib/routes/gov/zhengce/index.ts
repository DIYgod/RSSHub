import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: ['/zhengce/zuixin', '/zhengce/:category{.+}?'],
    categories: ['government'],
    example: '/gov/zhengce/zuixin',
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
            source: ['www.gov.cn/zhengce/zuixin', 'www.gov.cn/'],
        },
    ],
    name: '最新政策',
    maintainers: ['SettingDust', 'nczitzk'],
    handler,
    url: 'www.gov.cn/zhengce/zuixin',
};

async function handler(ctx) {
    const { category = 'zuixin' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;

    const rootUrl = 'https://www.gov.cn';
    const currentUrl = new URL(`zhengce/${category.replace(/\/$/, '')}/`, rootUrl).href;

    // BER：修改为请求JSON数据
    const jsonUrl = new URL('ZUIXINZHENGCE.json', currentUrl).href;
    const { data: jsonData } = await got(jsonUrl);

    const items = jsonData.slice(0, limit).map((item) => {
        const link = item.URL.startsWith('http') ? item.URL : new URL(item.URL, rootUrl).href;
        return {
            title: item.TITLE,
            link,
            description: `<br><br><br><br>正文详见链接：<br><a href="${link}">${item.TITLE}</a>`,
            author: '中国政府网',
            category: ['政策'],
            pubDate: timezone(parseDate(item.DOCRELPUBTIME, 'YYYY-MM-DD HH:mm:ss'), 8),
            guid: `gov-zhengce-${item.URL}`,
        };
    });

    return {
        item: items,
        title: '中国政府网',
        link: currentUrl,
        description: '最新政策',
        language: 'zh-CN',
        author: '中国政府网',
    };
}

export { handler };
