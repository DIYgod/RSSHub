import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cs/:category?',
    name: '计算机学院',
    url: 'cs.hrbust.edu.cn',
    maintainers: ['cscnk52'],
    handler,
    example: '/hrbust/cs',
    parameters: { category: '栏目标识，默认为 3709（学院要闻）' },
    description: `| 通知公告 | 学院要闻 | 常用下载 | 博士后流动站 | 学生指导 | 科研动态 | 科技成果 | 党建理论 | 党建学习 | 党建活动 | 党建风采 | 团学组织 | 学生党建 | 学生活动 | 心理健康 | 青春榜样 | 就业工作 | 校友风采 | 校庆专栏 | 专业介绍 | 本科生培养方案 | 硕士生培养方案 | 能力作风建设 | 博士生培养方案 | 省级实验教学示范中心 | 喜迎二十大系列活动 | 学习贯彻省十三次党代会精神 |
|----------|----------|----------|--------------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|----------------|----------------|--------------|----------------|----------------------|--------------------|----------------------------|
| 3708     | 3709     | 3710     | 3725         | 3729     | 3732     | 3733     | 3740     | 3741     | 3742     | 3743     | 3744     | 3745     | 3746     | 3747     | 3748     | 3751     | 3752     | 3753     | 3755     | 3756           | 3759           | nlzfjs       | pyfa           | sjsyjxsfzx           | srxxgcddesdjs      | xxgcssscddhjs              |`,
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
            source: ['cs.hrbust.edu.cn/:category/list.htm'],
            target: '/cs/:category',
        },
        {
            source: ['cs.hrbust.edu.cn'],
            target: '/cs',
        },
    ],
    view: ViewType.Notifications,
};

async function handler(ctx) {
    const rootUrl = 'https://cs.hrbust.edu.cn/';
    const { category = 3709 } = ctx.req.param();
    const columnUrl = `${rootUrl}${category}/list.htm`;
    const response = await ofetch(columnUrl);
    const $ = load(response);
    const bigTitle = $('li.col_title').text();

    const list = $('div.col_news_con li.news')
        .toArray()
        .map((item) => {
            const element = $(item);
            const link = new URL(element.find('a').attr('href'), rootUrl).href;
            const pubDateText = element.find('span.news_meta').text().trim();
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

                const author = $('span.arti_publisher').text().replace('发布者：', '').trim();

                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    description: content.html(),
                    author,
                };
            })
        )
    );

    return {
        title: `${bigTitle} - 哈尔滨理工大学计算机学院`,
        link: columnUrl,
        language: 'zh-CN',
        item: items,
    };
}
