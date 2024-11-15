import { Route } from '@/types';
import ofetch from '@/utils/ofetch'; // 统一使用的请求库
import { load } from 'cheerio'; // 类似 jQuery 的 API HTML 解析器

export const route: Route = {
    // ...
    path: ['/rank/:status', '/rank'],
    radar: [
        {
            source: ['m.air-level.com/rank/:status', 'm.air-level.com/rank'],
            target: '/rank/:status',
        },
    ],
    parameters: {
        status: '地区',
    },
    name: '空气质量排行',
    categories: ['popular'],
    maintainers: ['lt'],
    example: 'rank/best,rank',
    handler,
};

async function handler(ctx) {
    const status = ctx.req.param('status');
    const currentUrl = `https://m.air-level.com/rank`;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    let table = '';
    let title = '';

    const titlebest = $('body > div.container > div.row.page > div:nth-child(1) > div:nth-child(5) > h3').text().replaceAll('[]', '');
    const tablebest = $('body > div.container > div.row.page > div:nth-child(1) > div:nth-child(5) > table').html()?.toString();
    const titleworst = $('body > div.container > div.row.page > div:nth-child(1) > div:nth-child(3) > h3').text().replaceAll('[]', '');
    const tableworst = $('body > div.container > div.row.page > div:nth-child(1) > div:nth-child(3) > table').html()?.toString();

    if (status) {
        if (status === 'best') {
            title = titlebest;
            table = `<br/><table border="1 solid black">${tablebest}</table>`;
        }

        if (status === 'worsest') {
            title = titleworst;
            table = `<br/><table border="1 solid black">${tableworst}</table>`;
        }
    } else {
        title = $('body > div.container > div.row.page > div:nth-child(1) > h2').text().replaceAll('[]', '');
        table = `<br/>${titlebest}<br/><table border="1 solid black">${tablebest}</table><br/><table border="1 solid black">${titleworst}<br/>${tableworst}</table>`;
    }

    const pubtime = $('body > div.container > div.row.page > div:nth-child(1) > h4').text();

    const items = [
        {
            title,
            link: currentUrl,
            pubDate: new Date().toUTCString(),
            description: `${String(table)}`,
            guid: pubtime,
        },
    ];
    // console.log(items);
    return {
        title,
        item: items,
        description: `
        * 空气质量排行
        `,
        link: currentUrl,
    };
}
