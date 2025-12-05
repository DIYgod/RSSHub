import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
// 学校官网：http://www.upc.edu.cn/
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 地址映射
const MAP = {
    notice: 'tzgg',
    scholar: 'xsdt',
};
// 头部信息
const HEAD = {
    notice: '通知公告',
    scholar: '学术动态',
};

export const route: Route = {
    path: '/main/:type',
    categories: ['university'],
    example: '/upc/main/notice',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '主页',
    maintainers: ['Veagau'],
    handler,
    description: `| 通知公告 | 学术动态 |
| -------- | -------- |
| notice   | scholar  |`,
};

async function handler(ctx) {
    const baseUrl = 'https://news.upc.edu.cn';
    const type = ctx.req.param('type');
    const link = `${baseUrl}/${MAP[type]}.htm`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);
    // ## 获取列表
    const list = $('.main-list-box-left li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.li-right-bt a');
            const link = a.attr('href');
            return {
                title: a.text(),
                description: item.find('.li-right-zy a').text(),
                link: link.startsWith('http') ? link : `${baseUrl}/${link}`,
                pubDate: parseDate(item.find('.li-left').text(), 'DDYYYY-MM'),
            };
        });
    // ## 定义输出的item
    const out = await Promise.all(
        // ### 遍历列表，筛选出自己想要的内容
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.startsWith(`${baseUrl}/`) || item.link.includes('content.jsp')) {
                    return item;
                }
                // 获取详情页面的介绍
                const detail_response = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = load(detail_response.data);
                const detailContent = $('.v_news_content').html();
                // ### 设置 RSS feed item
                // author,
                item.description = detailContent;
                item.pubDate = timezone(parseDate($('.nr-xinxi i').first().text(), 'YYYY-MM-DD HH:mm:ss'), 8);
                // // ### 设置缓存
                return item;
            })
        )
    );

    return {
        title: HEAD[type] + `-中国石油大学（华东）`,
        link,
        description: HEAD[type] + `-中国石油大学（华东）`,
        item: out,
    };
}
