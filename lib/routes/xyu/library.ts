import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/library/:page?',
    categories: ['university'],
    example: '/xyu/library',
    parameters: { page: '页码，默认为 1' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新余学院图书馆通知公告',
    maintainers: [],
    handler,
    url: 'lib.xyc.edu.cn/index/tzgg.htm',
    radar: [
        {
            source: ['lib.xyc.edu.cn/index/tzgg.htm', 'lib.xyc.edu.cn/index/tzgg/:page.htm'],
            target: '/library',
        },
    ],
};

async function handler(ctx) {
    const page = ctx.req.param('page') ?? '1';
    const baseUrl = 'https://lib.xyc.edu.cn';
    const url = page && page > 1 ? `${baseUrl}/index/tzgg/${page}.htm` : `${baseUrl}/index/tzgg.htm`;

    const response = await ofetch(url);
    const $ = load(response);

    const items = $('.text-list ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a');
            const title = $link.attr('title') || $link.text().trim();
            const relativeUrl = $link.attr('href');
            const link = relativeUrl ? new URL(relativeUrl, baseUrl).href : '';
            // 提取日期
            const dateText = $item.find('.date').text().trim() || $item.text().match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
            const pubDate = dateText ? parseDate(dateText, 'YYYY-MM-DD') : new Date();

            return {
                title,
                link,
                pubDate,
                description: title,
            };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item.title && item.link));

    return {
        title: '新余学院图书馆通知公告',
        link: url,
        item: items,
    };
}
