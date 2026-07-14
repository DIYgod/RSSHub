import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/graduate/:type?',
    categories: ['university'],
    example: '/nankai/graduate/zxdt',
    parameters: { type: '栏目编号（若为空则默认为"zxdt"）' },
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
            source: ['graduate.nankai.edu.cn', 'graduate.nankai.edu.cn/:type/list.htm'],
            target: '/graduate/:type?',
        },
    ],
    name: '研究生院',
    maintainers: ['ladeng07'],
    description: `| 最新动态 | 综合信息 | 招生工作 | 培养管理 | 国际交流 | 学科建设 | 学位管理 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| zxdt     | 82       | 83       | 84       | 85       | 86       | 87       |`,
    url: 'graduate.nankai.edu.cn',
    handler: async (ctx) => {
        // 从 URL 参数中获取通知分类
        const { type = 'zxdt' } = ctx.req.param();
        const baseUrl = 'https://graduate.nankai.edu.cn';
        const { data: response } = await got(`${baseUrl}/${type}/list.htm`);
        const $ = load(response);

        // 获取分类名称映射
        const categoryMap: Record<string, string> = {
            zxdt: '最新动态',
            '82': '综合信息',
            '83': '招生工作',
            '84': '培养管理',
            '85': '国际交流',
            '86': '学科建设',
            '87': '学位管理',
        };

        const categoryName = categoryMap[type] || '最新动态';

        // 解析新闻列表
        const list = $('.newslist li')
            .not('#wp_paging_w6 li')
            .toArray()
            .map((li) => {
                const $li = $(li);
                const $titleDiv = $li.find('.title');
                const $link = $titleDiv.find('a');
                const $timeDiv = $li.find('.time');

                const title = $link.attr('title');
                let link = $link.attr('href') || '';

                // 处理相对链接
                link = link && !link.startsWith('http') ? `${baseUrl}${link}` : link;

                // 提取日期
                const dateStr = $timeDiv.text().trim();
                const pubDate = timezone(parseDate(dateStr, 'YYYY-MM-DD'), 8);

                return {
                    title,
                    link,
                    pubDate,
                    author: '研究生院',
                    description: '', // 初始化description属性
                };
            })
            .filter((item) => item && item.link && item.title); // 过滤掉空项目和没有链接的项目

        // 获取每篇文章的详细内容
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    try {
                        const { data: response } = await got(item.link);
                        const $ = load(response);

                        // 尝试多种内容选择器
                        const $description = $('.wp_articlecontent');

                        // 处理相对链接，转换为绝对链接
                        if ($description.length > 0) {
                            // 处理链接
                            $description.find('a').each((i, el) => {
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

                            // 处理图片
                            $description.find('img').each((i, el) => {
                                const $el = $(el);
                                let src = $el.attr('src');

                                if (src && !src.startsWith('http')) {
                                    src = src.startsWith('/') ? `${baseUrl}${src}` : `${baseUrl}/${src}`;
                                    $el.attr('src', src);
                                }
                            });

                            // 处理PDF播放器div，提取PDF链接
                            $description.find('.wp_pdf_player').each((i, el) => {
                                const $el = $(el);
                                const pdfSrc = $el.attr('pdfsrc');
                                const sudyfileAttr = ($el.attr('sudyfile-attr') || '{}').replaceAll("'", '"');

                                try {
                                    const sudyfileAttrJson = JSON.parse(sudyfileAttr);
                                    const fileName = sudyfileAttrJson.title || '未命名文件.pdf';
                                    if (pdfSrc) {
                                        let pdfUrl = pdfSrc;
                                        if (!pdfUrl.startsWith('http')) {
                                            pdfUrl = `${baseUrl}${pdfUrl}`;
                                        }
                                        // 替换PDF播放器为下载链接
                                        $el.replaceWith(`<p><a href="${pdfUrl}" target="_blank">📄 ${fileName}</a></p>`);
                                    }
                                } catch {
                                    // 如果解析失败，保留原始内容
                                }
                            });
                        }

                        item.description = $description.html() || item.title;
                    } catch {
                        // 如果获取详细内容失败，返回基本信息
                        item.description = item.title + ' (获取详细内容失败)';
                    }
                    return item;
                })
            )
        );

        return {
            // 源标题
            title: `南开大学研究生院-${categoryName}`,
            // 源链接
            link: `${baseUrl}/${type}/list.htm`,
            // 源文章
            item: items,
        };
    },
};
