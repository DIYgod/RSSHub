import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';

export const route: Route = {
    path: '/gzc/:category?',
    name: '国有资产管理处',
    url: 'gzc.hrbust.edu.cn',
    maintainers: ['cscnk52'],
    handler,
    example: '/hrbust/gzc',
    parameters: { category: '栏目标识，默认为 1305（热点新闻）' },
    description: `| 政策规章 | 资料下载 | 处务公开 | 招标信息 | 岗位职责 | 管理办法 | 物资处理 | 工作动态 | 热点新闻 |
|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| 1287     | 1288     | 1289     | 1291     | 1300     | 1301     | 1302     | 1304     | 1305     |`,
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
            source: ['gzc.hrbust.edu.cn/:category/list.htm'],
            target: '/gzc/:category',
        },
        {
            source: ['gzc.hrbust.edu.cn'],
            target: '/gzc',
        },
    ],
    view: ViewType.Notifications,
};

async function handler(ctx) {
    const rootUrl = 'https://gzc.hrbust.edu.cn/';
    const { category = 1305 } = ctx.req.param();
    const columnUrl = `${rootUrl}${category}/list.htm`;
    const response = await ofetch(columnUrl);
    const $ = load(response);
    const bigTitle = $('li.col-title').text();

    const list = $('ul.wp_article_list li.list_item')
        .toArray()
        .map((item) => {
            const element = $(item);
            const link = new URL(element.find('a').attr('href'), rootUrl).href;
            const pubDateText = element.find('span.Article_PublishDate').text().trim();
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
        title: `${bigTitle} - 哈尔滨理工大学国有资产管理处`,
        link: columnUrl,
        language: 'zh-CN',
        item: items,
    };
}
