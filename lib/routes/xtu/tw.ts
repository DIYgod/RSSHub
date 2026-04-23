import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Route } from '@/types';

const rootUrl = 'https://tw.xtu.edu.cn/';
const host = 'tw.xtu.edu.cn';

const handler: Route['handler'] = async (ctx) => {
    const type = ctx.req.param('type') ?? 'tzgg';
    const typeDict = {
        tzgg: ['通知公告', 'tzgg.htm'],
        xnxw: ['校内新闻', 'xnxw.htm'],
    };

    if (!typeDict[type]) {
        throw new Error(`Invalid type: ${type}`);
    }

    const listUrl = `${rootUrl}${typeDict[type][1]}`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    // 根据类型选择不同的选择器
    const listSelector = type === 'xnxw' ? '.pt-tx' : '.text-list2 li, .text-list li';

    const list = $(listSelector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            // xnxw 页面结构不同：li > a > div.pt-tx > h3 + p + span
            const $a = type === 'xnxw' ? $item.closest('a') : $item.find('a').first();

            let title = $a.attr('title') || $item.find('h2, h3').text() || $a.text() || '';
            let link = $a.attr('href') || '';

            // 处理相对路径
            if (link && !link.startsWith('http')) {
                if (link.startsWith('../')) {
                    link = rootUrl + link.replace('../', '');
                } else if (link.startsWith('./')) {
                    link = rootUrl + link.replace('./', '');
                } else if (link.startsWith('/')) {
                    link = rootUrl.slice(0, -1) + link;
                } else {
                    link = rootUrl + link;
                }
            }

            let pubDate: Date | undefined;

            if (type === 'xnxw') {
                // xnxw 页面：日期在 span 中，格式 2026-04-21
                const dateText = $item.find('span').last().text().trim();
                if (dateText) {
                    pubDate = timezone(parseDate(dateText), +8);
                }
            } else {
                // tzgg 页面：从 date2 结构中提取日期
                const $dateP = $item.find('.date2 p');
                const $dateSpan = $item.find('.date2 span');
                if ($dateP.length && $dateSpan.length) {
                    const day = $dateP.text().trim();
                    const yearMonth = $dateSpan.text().trim();
                    const dateText = `${yearMonth}-${day}`;
                    pubDate = timezone(parseDate(dateText), +8);
                }
            }

            return {
                title: title.trim(),
                link: link.trim(),
                pubDate,
            };
        })
        .filter((item) => item.title && item.link);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const newItem = {
                    ...item,
                    description: '',
                };

                try {
                    const linkHost = new URL(item.link).hostname;
                    if (host === linkHost) {
                        const response = await ofetch(item.link);
                        const $ = load(response);

                        // 尝试多种可能的内容选择器
                        const contentSelectors = ['.v_news_content', '.content-detail', '.article-content', '.wp_articlecontent', '#main-content', '.content', '.news-content', '.infodetail'];

                        for (const selector of contentSelectors) {
                            const content = $(selector).html();
                            if (content) {
                                newItem.description = content;
                                break;
                            }
                        }

                        // 如果没找到内容，返回链接提示
                        if (!newItem.description) {
                            newItem.description = `<p>请访问原网页查看内容：<a href="${item.link}">${item.title}</a></p>`;
                        }
                    } else {
                        // 外部链接
                        newItem.description = `<p>外部链接：<a href="${item.link}">${item.title}</a></p>`;
                    }
                } catch {
                    newItem.description = `<p>获取内容失败，请访问原网页：<a href="${item.link}">${item.title}</a></p>`;
                }

                return newItem;
            })
        )
    );

    return {
        title: `湘潭大学团委 - ${typeDict[type][0]}`,
        link: listUrl,
        item: items,
    };
};

export const route: Route = {
    name: '团委',
    path: '/tw/:type?',
    example: '/xtu/tw/tzgg',
    url: 'tw.xtu.edu.cn',
    handler,
    categories: ['university'],
    maintainers: ['zzy00747'],
    parameters: {
        type: '栏目类型，见下表，默认为通知公告',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `| 栏目 | 参数 | 说明 |
| ---- | ---- | ---- |
| 通知公告 | tzgg | 团委通知公告 |
| 校内新闻 | xnxw | 校内新闻动态 |`,
};
