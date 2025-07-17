import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/nankai/jwc',
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
            source: ['jwc.nankai.edu.cn/tzgg/list.htm'],
            target: '/jwc',
        },
    ],
    name: '教务处通知公告',
    maintainers: ['vicguo0724'],
    description: '南开大学教务处通知公告',
    url: 'jwc.nankai.edu.cn',
    handler: async () => {
        const baseUrl = 'https://jwc.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/tzgg/list.htm`);
        const $ = load(response);

        // 解析列表页面中的所有通知项
        const list = $('.page-con-list-news .item')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const $link = $item.find('.t a');
                const $dateDay = $item.find('.d .d-d');
                const $dateMonth = $item.find('.d .d-m');

                // 构建完整的日期
                const day = $dateDay.text().trim(); // 格式：04
                const monthYear = $dateMonth.text().trim(); // 格式：2025/06
                const fullDate = `${monthYear}/${day}`; // 2025/06/04

                let linkStr = $link.attr('href');
                // 处理相对链接
                if (linkStr && !linkStr.startsWith('http')) {
                    linkStr = `${baseUrl}${linkStr}`;
                }

                return {
                    title: $link.text().trim(),
                    link: linkStr,
                    pubDate: timezone(parseDate(fullDate, 'YYYY/MM/DD'), +8),
                };
            })
            .filter((item) => item.link); // 过滤掉没有链接的项目

        // 获取每个通知的详细内容
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    try {
                        const { data: response } = await got(item.link);
                        const $ = load(response);

                        // 获取发布时间（更精确的时间）
                        const publishTimeText = $('.page-news-souse').text();
                        const timeMatch = publishTimeText.match(/发布时间：(\d{4}-\d{2}-\d{2})/);
                        if (timeMatch) {
                            item.pubDate = timezone(parseDate(timeMatch[1]), +8);
                        }

                        // 获取文章内容
                        const content = $('.page-news-con .wp_articlecontent');
                        if (content.length > 0) {
                            // 处理PDF链接，转换为绝对链接
                            content.find('a').each((i, el) => {
                                const $el = $(el);
                                const href = $el.attr('href');
                                if (href && !href.startsWith('http')) {
                                    if (href.startsWith('/')) {
                                        $el.attr('href', `${baseUrl}${href}`);
                                    } else {
                                        $el.attr('href', `${baseUrl}/${href}`);
                                    }
                                }
                            });

                            // 处理PDF播放器div，提取PDF链接
                            content.find('.wp_pdf_player').each((i, el) => {
                                const $el = $(el);

                                const pdfSrc = $el.attr('pdfsrc');
                                const sudyfileAttr = ($(el).attr('sudyfile-attr') || '{}').replaceAll("'", '"');
                                const sudyfileAttrJson = JSON.parse(sudyfileAttr);
                                const fileName = sudyfileAttrJson.title || '未命名文件.pdf';
                                if (pdfSrc) {
                                    let pdfUrl = pdfSrc;
                                    if (!pdfUrl.startsWith('http')) {
                                        pdfUrl = `${baseUrl}${pdfUrl}`;
                                    }
                                    // 替换PDF播放器为下载链接
                                    $el.replaceWith(`<p><a href="${pdfUrl}" target="_blank">${fileName}</a></p>`);
                                }
                            });

                            item.description = content.html();
                        } else {
                            item.description = '无法获取内容详情';
                        }
                    } catch {
                        item.description = '获取内容失败';
                    }
                    return item;
                })
            )
        );

        return {
            title: '南开大学教务处-通知公告',
            link: `${baseUrl}/tzgg/list.htm`,
            item: items,
        };
    },
};
