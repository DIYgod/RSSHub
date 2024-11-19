import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { load } from 'cheerio'; // 类似 jQuery 的 API HTML 解析器

export const route: Route = {
    path: '/air/:area',
    radar: [
        {
            source: ['m.air-level.com/air/:area/'],
            target: '/air/:area',
        },
    ],
    parameters: {
        area: '地区',
    },
    name: '空气质量',
    maintainers: ['lifetraveler'],
    example: '/air-level/air/xian',
    handler,
};

async function handler(ctx) {
    const area = ctx.req.param('area');
    const currentUrl = `https://m.air-level.com/air/${area}`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const title = $('body > div.container > div.row.page > div:nth-child(1) > h2').text().replaceAll('[]', '');

    const table = $('body > div.container > div.row.page > div:nth-child(1) > div:nth-child(3) > table');

    const qt = $('body > div.container > div.row.page > div:nth-child(1) > div.aqi-dv > div > span.aqi-bg.aqi-level-2').text();
    const pubtime = $('body > div.container > div.row.page > div:nth-child(1) > div.aqi-dv > div > span.label.label-info').text();

    const items = [
        {
            title: title + ' ' + qt + ' ' + pubtime,
            link: currentUrl,
            description: `<table border="1 solid black">${table.html()}</table>`,
            guid: pubtime,
        },
    ];
    return {
        title,
        item: items,
        description: '订阅每个城市的天气质量',
        link: currentUrl,
    };
}
