import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:category?',
    categories: ['university'],
    example: '/hlju/news/hdyw',
    parameters: {
        category: {
            description: '新闻分类，默认为黑大要闻',
            options: [
                { value: 'hdyw', label: '黑大要闻' },
                { value: 'jjxy', label: '菁菁校园' },
                { value: 'rwfc', label: '人物风采' },
                { value: 'xwdt', label: '新闻动态' },
                { value: 'jxky', label: '教学科研' },
                { value: 'xyjw', label: '学院经纬' },
                { value: 'jlhz', label: '交流合作' },
                { value: 'cxcy', label: '创新创业' },
            ],
        },
    },
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
            source: ['hdxw.hlju.edu.cn/:category.htm', 'hdxw.hlju.edu.cn/'],
            target: '/news/:category',
        },
    ],
    name: '新闻网',
    maintainers: ['LCMs-YoRHa'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'hdyw';
    const baseUrl = 'https://hdxw.hlju.edu.cn';
    const listUrl = `${baseUrl}/${category}.htm`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    // 从页面自动获取栏目名称
    const categoryName = $('.bgtitle_list').text().trim() || '黑大要闻';

    // 查找所有新闻链接 - 匹配 info/ 路径的链接，使用 map 而不是 push
    const list = $('a[href*="info/"]')
        .toArray()
        .map((element) => {
            const item = $(element);
            const link = item.attr('href');
            const title = item.text().trim();

            if (!title || !link || title.length < 5) {
                return null;
            }

            // 查找日期信息 - 在同一行或附近
            const parent = item.parent();
            const dateMatch = parent.text().match(/(\d{4})\/(\d{2})\/(\d{2})/);

            return {
                title,
                link: link.startsWith('http') ? link : `${baseUrl}/${link}`,
                pubDate: dateMatch ? parseDate(dateMatch[0].replaceAll('/', '-')) : undefined,
            } satisfies DataItem;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    // 限制返回数量并去重
    const uniqueList = list.filter((item, index, arr) => arr.findIndex((i) => i.link === item.link) === index).slice(0, 15);

    // 获取每篇文章的详细内容
    const items = await Promise.all(
        uniqueList.map((item) =>
            cache.tryGet(item.link, async () => {
                // 跳过外部链接
                if (!item.link.includes('hdxw.hlju.edu.cn')) {
                    return {
                        title: item.title,
                        link: item.link,
                        description: '外部链接，请点击查看原文',
                        pubDate: item.pubDate,
                    };
                }

                const detailResponse = await ofetch(item.link);
                const $detail = load(detailResponse);

                // 提取文章内容 - 只使用主要内容选择器
                const content = $detail('.v_news_content');
                let description: string;

                if (content.length > 0) {
                    // 清理内容
                    content.find('script, style, .print, .share').remove();
                    description = content.html() || '';
                } else {
                    description = '内容获取失败，请点击查看原文';
                }

                // 提取精确的发布时间
                let pubDate = item.pubDate;
                const timeElement = $detail('.timestyle110144');
                if (timeElement.length > 0) {
                    const timeText = timeElement.text().trim();
                    const timeMatch = timeText.match(/(\d{4}[-/]\d{2}[-/]\d{2})\s*(\d{2}:\d{2}(?::\d{2})?)/);
                    if (timeMatch) {
                        const dateStr = timeMatch[1].replaceAll('/', '-');
                        const timeStr = timeMatch[2];
                        pubDate = parseDate(`${dateStr} ${timeStr}`);
                    }
                }

                return {
                    title: item.title,
                    link: item.link,
                    description: description || '无法获取文章内容，请点击查看原文',
                    pubDate,
                };
            })
        )
    );

    return {
        title: `黑龙江大学新闻网 - ${categoryName}`,
        link: listUrl,
        description: `黑龙江大学新闻网${categoryName}栏目`,
        item: items,
    };
}
