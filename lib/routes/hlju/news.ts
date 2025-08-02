import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
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
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'hdyw';
    const baseUrl = 'https://hdxw.hlju.edu.cn';

    // 栏目名称映射
    const categoryMap = {
        hdyw: '黑大要闻',
        jjxy: '菁菁校园',
        rwfc: '人物风采',
        xwdt: '新闻动态',
        jxky: '教学科研',
        xyjw: '学院经纬',
        jlhz: '交流合作',
        cxcy: '创新创业',
    };

    const categoryName = categoryMap[category] || '黑大要闻';
    const listUrl = `${baseUrl}/${category}.htm`;

    const response = await ofetch(listUrl);

    const $ = load(response);

    // 提取新闻列表项 - 基于实际页面结构
    const list: Array<{
        title: string;
        link: string;
        pubDate?: Date;
    }> = [];

    // 查找所有新闻链接 - 匹配 info/ 路径的链接
    $('a[href*="info/"]').each((_, element) => {
        const item = $(element);
        const link = item.attr('href');
        const title = item.text().trim();

        if (!title || !link || title.length < 5) {
            return;
        }

        // 查找日期信息 - 在同一行或附近
        const parent = item.parent();
        const dateMatch = parent.text().match(/(\d{4})\/(\d{2})\/(\d{2})/);

        list.push({
            title,
            link: link.startsWith('http') ? link : `${baseUrl}/${link}`,
            pubDate: dateMatch ? parseDate(dateMatch[0].replaceAll('/', '-')) : undefined,
        });
    });

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

                try {
                    const detailResponse = await ofetch(item.link);
                    const $detail = load(detailResponse);

                    // 提取文章内容
                    let description = '';

                    // 尝试多种内容选择器
                    const contentSelectors = ['.v_news_content', '.news_content', '.article-content', '.content', 'table[width="692"] td', 'td[valign="top"]'];

                    for (const selector of contentSelectors) {
                        const content = $detail(selector);
                        if (content.length > 0) {
                            // 清理内容
                            content.find('script, style, .nav, .breadcrumb').remove();
                            const htmlContent = content.html();
                            if (htmlContent) {
                                description = htmlContent;
                                break;
                            }
                        }
                    }

                    // 如果没有找到特定的内容区域，尝试提取主要文本内容
                    if (!description) {
                        const bodyContent = $detail('body').text();
                        const paragraphs = bodyContent
                            .split('\n')
                            .map((p) => p.trim())
                            .filter((p) => p.length > 20 && !p.includes('版权所有') && !p.includes('关闭窗口'))
                            .slice(0, 5);
                        description = paragraphs.map((p) => `<p>${p}</p>`).join('');
                    }

                    // 提取发布时间
                    let pubDate = item.pubDate;
                    if (!pubDate) {
                        const timeText = $detail('body').text();
                        const dateMatch = timeText.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日\s]/);
                        if (dateMatch) {
                            pubDate = parseDate(`${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`);
                        }
                    }

                    return {
                        title: item.title,
                        link: item.link,
                        description: description || '无法获取文章内容，请点击查看原文',
                        pubDate,
                    };
                } catch {
                    return {
                        title: item.title,
                        link: item.link,
                        description: '获取文章内容失败，请点击查看原文',
                        pubDate: item.pubDate,
                    };
                }
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
