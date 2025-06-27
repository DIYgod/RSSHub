import type { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/grs/yjszs',
    categories: ['university'],
    example: '/zju/grs/yjszs',
    parameters: {},
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
            source: ['www.grs.zju.edu.cn/yjszs/28498/list.htm'],
        },
    ],
    name: '研究生院 - 研究生招生通知',
    maintainers: ['heikuisey'],
    url: 'www.grs.zju.edu.cn/yjszs/28498/list.htm',
    handler: async () => {
        const baseUrl = 'http://www.grs.zju.edu.cn';
        const listUrl = 'http://www.grs.zju.edu.cn/yjszs/28498/list.htm';

        const response = await got(listUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        const $ = load(response.data);

        // 先查找包含具体通知的区域，排除导航链接
        const noticeLinks = $('a[href*="/yjszs/"]').filter((_, element) => {
            const href = $(element).attr('href') || '';
            const text = $(element).text().trim();

            // 过滤掉导航链接和无关链接
            return (
                href.includes('/c28498a') || // 包含具体文章ID的链接
                (href.includes('/yjszs/') &&
                    text.length > 10 &&
                    !text.includes('首页') &&
                    !text.includes('招生信息') &&
                    !text.includes('学校资源') &&
                    !text.includes('各类统计') &&
                    !text.includes('联系我们') &&
                    !text.includes('硕士招生') &&
                    !text.includes('博士招生') &&
                    !text.includes('港澳台招生') &&
                    !text.includes('国际学生招生'))
            );
        });

        const items = noticeLinks
            .toArray()
            .map((element) => {
                const $item = $(element);

                // 直接从链接元素提取信息
                const title = $item.text().trim();
                const link = $item.attr('href') || '';

                // 查找日期信息（从同级的span.date元素中提取）
                let dateStr = '';
                const $parent = $item.parent();
                const $dateSpan = $parent.find('span.date');
                if ($dateSpan.length > 0) {
                    dateStr = $dateSpan.text().trim();
                } else {
                    // 如果没有找到span.date，尝试从父元素文本中提取
                    const parentText = $parent.text();
                    const dateRegex = /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/;
                    const dateMatch = parentText.match(dateRegex);
                    if (dateMatch) {
                        dateStr = dateMatch[1].replaceAll('/', '-');
                    }
                }

                // 处理相对链接
                const fullLink = link.startsWith('http') ? link : baseUrl + link;

                // 过滤有效项目
                if (title && title.length > 3) {
                    // 使用北京时间（+0800）
                    let pubDate: Date;
                    if (dateStr) {
                        // 添加北京时区标识
                        const dateWithTime = `${dateStr} 10:00:00 +0800`;
                        pubDate = parseDate(dateWithTime, 'YYYY-MM-DD HH:mm:ss ZZ');
                    } else {
                        pubDate = new Date();
                    }

                    return {
                        title: title.replaceAll(/\s+/g, ' ').trim(),
                        link: fullLink,
                        description: title,
                        pubDate,
                        author: '浙江大学研究生院',
                        category: ['研究生招生'],
                    };
                }
                return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        // 获取前15个通知的详细内容
        const itemsWithDescription = await Promise.all(
            items.slice(0, 15).map(
                async (item) =>
                    await cache.tryGet(item.link, async () => {
                        try {
                            const articleResponse = await got(item.link, {
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                },
                                timeout: {
                                    request: 5000,
                                },
                            });

                            const article$ = load(articleResponse.data);

                            // 尝试多种选择器提取正文内容
                            const contentSelectors = ['.wp_articlecontent', '.article-content', '#vsb_content', '.content', '.main-content', '.post-content'];

                            let content = '';
                            for (const selector of contentSelectors) {
                                const contentElement = article$(selector);
                                if (contentElement.length > 0) {
                                    content = contentElement.html() || '';
                                    break;
                                }
                            }

                            // 如果没有找到内容区域，使用标题作为描述
                            if (!content || content.length < 50) {
                                content = item.title;
                            }

                            return {
                                ...item,
                                description: content,
                            };
                        } catch {
                            // 获取详细内容失败时返回原始项目
                            return item;
                        }
                    })
            )
        );

        return {
            title: '浙江大学研招网 - 研究生招生通知',
            link: listUrl,
            description: '浙江大学研究生院最新招生通知和公告',
            item: itemsWithDescription.length > 0 ? itemsWithDescription : items.slice(0, 20),
        };
    },
};
