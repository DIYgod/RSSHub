import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';

export const route: Route = {
    path: '/nic/:category?',
    name: '网络信息中心',
    url: 'nic.hrbust.edu.cn',
    maintainers: ['cscnk52'],
    handler,
    example: '/hrbust/nic',
    parameters: { category: '栏目标识，默认为 3988（新闻动态）' },
    description: `| 服务指南 | 常见问题 | 新闻动态 | 通知公告 | 国家政策法规 | 学校规章制度 | 部门规章制度 | 宣传教育 | 安全法规 |
|----------|----------|----------|----------|--------------|--------------|--------------|----------|----------|
| 3982     | 3983     | 3988     | 3989     | 3990         | 3991         | 3992         | 3993     | 3994     |`,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['nic.hrbust.edu.cn/:category/list.htm'],
            target: '/nic/:category',
        },
        {
            source: ['nic.hrbust.edu.cn/'],
            target: '/nic/',
        },
    ],
    view: ViewType.Notifications,
};

async function handler(ctx) {
    const rootUrl = 'https://nic.hrbust.edu.cn/';

    const { category = 3988 } = ctx.req.param();

    const url = `${rootUrl}${category}/list.htm`;

    const response = await ofetch(url);

    const $ = load(response);

    const bigTitle = $('li.col_title').text();

    const list = $('ul.news_list.list2 li')
        .toArray()
        .map((item) => {
            const element = $(item);
            const title = element.find('a').text().trim();
            const link = new URL(element.find('a').attr('href'), rootUrl).href;

            const pubDateText = element.find('span.news_meta').text().trim();
            const pubDate = pubDateText ? timezone(parseDate(pubDateText), +8) : null;
            return {
                title,
                pubDate,
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.startsWith(rootUrl)) {
                    item.description = '本文需跳转，请点击原文链接后阅读';
                    return item;
                }

                const response = await ofetch(item.link);
                const $ = load(response);

                item.author = $('span.arti_publisher').text().replace('发布者：', '').trim();

                const body = $('div.wp_articlecontent');
                body.find('[style]').removeAttr('style');
                body.find('font').contents().unwrap();
                body.html(body.html()?.replaceAll('&nbsp;', ''));
                body.find('[align]').removeAttr('align');
                item.description = body.html();
                return item;
            })
        )
    );

    return {
        title: `哈尔滨理工大学网络信息中心 - ${bigTitle}`,
        link: rootUrl,
        item: items,
    };
}
