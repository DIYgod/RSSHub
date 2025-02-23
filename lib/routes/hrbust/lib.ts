import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';

export const route: Route = {
    path: '/lib/:category?',
    name: '图书馆',
    url: 'lib.hrbust.edu.cn',
    maintainers: ['cscnk52'],
    handler,
    example: '/hrbust/lib',
    parameters: { category: '栏目标识，默认为 3421（公告消息）' },
    description: `| 公告消息 | 资源动态 | 参考中心 | 常用工具 | 外借服务 | 报告厅及研讨间服务 | 外文引进数据库 | 外文电子图书 | 外文试用数据库 | 中文引进数据库 | 中文电子图书 | 中文试用数据库 |
|----------|----------|----------|----------|----------|--------------------|----------------|--------------|----------------|----------------|--------------|----------------|
| 3421     | 3422     | ckzx     | cygj     | wjfw     | ytjfw              | yw             | yw_3392      | yw_3395        | zw             | zw_3391      | zw_3394        |`,
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
            source: ['lib.hrbust.edu.cn/:category/list.htm'],
            target: '/lib/:category',
        },
        {
            source: ['lib.hrbust.edu.cn'],
            target: '/lib',
        },
    ],
    view: ViewType.Notifications,
};

async function handler(ctx) {
    const rootUrl = 'https://lib.hrbust.edu.cn/';
    const { category = 3421 } = ctx.req.param();
    const columnUrl = `${rootUrl}${category}/list.htm`;
    const response = await ofetch(columnUrl);
    const $ = load(response);
    const bigTitle = $('span.Column_Anchor').text();

    const list = $('ul.tu_b3 li:not([class])')
        .toArray()
        .map((item) => {
            const element = $(item);
            const link = new URL(element.find('a').attr('href'), rootUrl).href;
            const pubDateText = element.find('span').text().trim();
            const pubDate = pubDateText ? timezone(parseDate(pubDateText), +8) : null;
            return {
                title: element.find('a').text().trim(),
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
                const content = $('div.wp_articlecontent');

                content.find('[style]').removeAttr('style');
                content.find('font').contents().unwrap();
                content.html(content.html()?.replaceAll('&nbsp;', ''));
                content.find('[align]').removeAttr('align');

                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    description: content.html(),
                };
            })
        )
    );

    return {
        title: `${bigTitle} - 哈尔滨理工大学图书馆`,
        link: columnUrl,
        language: 'zh-CN',
        item: items,
    };
}
