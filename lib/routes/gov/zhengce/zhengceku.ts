import { Route } from '@/types';
import buildData from '@/utils/common-config';

export const route: Route = {
    path: '/zhengce/zhengceku/:department',
    categories: ['government'],
    example: '/gov/zhengce/zhengceku/bmwj',
    parameters: { department: '库名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国务院政策文件库',
    maintainers: ['zxx-457'],
    handler,
};

async function handler(ctx) {
    const department = ctx.req.param('department');
    const link = `http://www.gov.cn/zhengce/zhengceku/${department}/`;

    return await buildData({
        link,
        url: link,
        title: `%title%`,
        description: '政府文件库, 当页的所有列表',
        params: {
            title: `$('.channel_tab > .noline > a').text().trim() + ' - 政府文件库'`,
        },
        item: {
            item: '.news_box > .list > ul > li:not(.line)',
            title: `$('h4 > a').text()`,
            link: `$('h4 > a').attr('href')`,
            pubDate: `parseDate($('h4 > .date').text().trim())`,
        },
    });
}
