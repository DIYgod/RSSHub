import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cc/:type?',
    categories: ['university'],
    example: '/nankai/cc/13291',
    parameters: { type: '栏目编号（若为空则默认为"最新动态"）' },
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
            source: ['cc.nankai.edu.cn', 'cc.nankai.edu.cn/:type/list.htm'],
            target: '/cc/:type?',
        },
    ],
    name: '计算机学院',
    maintainers: ['vicguo0724'],
    description: `| 最新动态 | 学院公告 | 学生工作通知 | 科研信息 | 本科生教学 | 党团园地 | 研究生招生 | 研究生教学 | 境外交流 |
| -------- | -------- | ---------- | -------- | ---------- | -------- | ---------- | ---------- | -------- |
| 13291    | 13292    | 13293      | 13294    | 13295      | 13296    | 13297      | 13298      | 13299    |`,
    url: 'cc.nankai.edu.cn',
    handler: async (ctx) => {
        // 从 URL 参数中获取通知分类
        const { type = '13291' } = ctx.req.param();
        const baseUrl = 'https://cc.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/${type}/list.htm`);
        const $ = load(response);

        // 获取分类名称
        const categoryName = $('.accordion .selected a').text().trim() || '最新动态';

        // 解析新闻列表
        const list = $('#wp_news_w49 table tr')
            .slice(1) // 跳过表头
            .toArray()
            .map((tr) => {
                const $tr = $(tr);
                const cells = $tr.find('td');

                if (cells.length < 5) {
                    return null;
                }

                const title = cells.eq(1).text().trim();
                const publisher = cells.eq(2).text().trim();
                const dateStr = cells.eq(3).text().trim();

                // 从onclick属性中提取链接
                const onclick = $tr.attr('onclick');
                let link = '';
                if (onclick) {
                    const match = onclick.match(/window\.location\.href='([^']+)';/);
                    if (match) {
                        link = match[1];
                        if (!link.startsWith('http')) {
                            link = `${baseUrl}${link}`;
                        }
                    }
                }

                return {
                    title,
                    link,
                    pubDate: timezone(parseDate(dateStr), +8),
                    author: publisher,
                };
            })
            .filter((item) => item && item.link); // 过滤掉空项目和没有链接的项目

        // 获取每篇文章的详细内容
        const items = await Promise.all(
            list.map((item) =>
                item
                    ? cache.tryGet(item.link, async () => {
                          try {
                              const { data: response } = await got(item.link);
                              const $ = load(response);

                              // 优化内容选择器逻辑，避免重复选择
                              let description = $('.wp_articlecontent').html() || $('.body-news-detail').html();

                              description = description || item.title;
                              item.description = description;
                          } catch {
                              // 如果获取详细内容失败，返回基本信息
                              item.description = item.title + ' (获取详细内容失败)';
                          }
                          return item;
                      })
                    : null
            )
        );

        return {
            // 源标题
            title: `南开大学计算机学院-${categoryName}`,
            // 源链接
            link: `${baseUrl}/${type}/list.htm`,
            // 源文章
            item: items,
        };
    },
};
