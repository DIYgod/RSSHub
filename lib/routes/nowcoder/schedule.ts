import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/schedule/:propertyId?/:typeId?',
    categories: ['bbs'],
    example: '/nowcoder/schedule',
    parameters: { propertyId: '行业, 在控制台中抓取接口，可获得行业id，默认0', typeId: '类别，同上' },
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
            source: ['nowcoder.com/'],
            target: '/schedule',
        },
    ],
    name: '校招日程',
    maintainers: ['junfengP'],
    handler,
    url: 'nowcoder.com/',
};

async function handler(ctx) {
    const propertyId = ctx.req.param('propertyId') ?? 0;
    const typeId = ctx.req.param('typeId') ?? 0;

    const link = `https://www.nowcoder.com/school/schedule/data?token=&query=&typeId=${typeId}&propertyId=${propertyId}&onlyFollow=false&_=${Date.now()}`;
    const responseBody = (await got(link)).data;
    if (responseBody.code !== 0) {
        throw new Error(`接口错误，错误代码:${responseBody.code},错误原因:${responseBody.msg}`);
    }
    const data = responseBody.data.companyList;

    return {
        title: '名企校招日程',
        link: 'https://www.nowcoder.com/school/schedule',
        description: '名企校招日程',
        item: data.map((item) => {
            let desc = `<tr><td><img src="${item.logo}" referrerpolicy="no-referrer""></td></tr>`;
            for (const each of item.schedules) {
                desc += `<tr><td>${each.content}</td><td>${each.time}</td></tr>`;
            }
            return {
                title: item.name,
                description: `<table>${desc}</table>`,
                pubDate: parseDate(item.createTime),
                link: `https://www.nowcoder.com/school/schedule/${item.id}`,
            };
        }),
    };
}
