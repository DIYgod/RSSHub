import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Route } from '@/types';

const rootUrl = 'https://jwc.xtu.edu.cn/';
const host = 'jwc.xtu.edu.cn';

const handler: Route['handler'] = async (ctx) => {
    const type = ctx.req.param('type') ?? 'tzgg';
    const listUrl = type === 'xkjs' ? `${rootUrl}xkjs/tzgg.htm` : `${rootUrl}tzgg.htm`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const list = $('.col-md-9 li')
        .toArray()
        .filter((item) => {
            const $item = $(item);
            // 只保留包含 span 日期和 a 链接的列表项
            return $item.find('span').length > 0 && $item.find('a').length > 0;
        })
        .map((item) => {
            const $item = $(item);
            const $a = $item.find('a');
            const $span = $item.find('span');

            let title = $a.attr('title') || $a.text() || '';
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

            const dateText = $span.text().trim();
            const pubDate = dateText ? timezone(parseDate(dateText), +8) : undefined;

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
                        const contentSelectors = ['.v_news_content', '.content-detail', '.article-content', '.wp_articlecontent', '#main-content', '.content'];

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
        title: type === 'xkjs' ? '湘潭大学教务处 - 学科竞赛通知公告' : '湘潭大学教务处 - 通知公告',
        link: listUrl,
        item: items,
    };
};

export const route: Route = {
    name: '教务处通知公告',
    path: '/jwc/:type?',
    example: '/xtu/jwc/tzgg',
    url: 'jwc.xtu.edu.cn',
    handler,
    categories: ['university'],
    maintainers: ['zzy00747'],
    parameters: {
        type: '通知类型，见下表，默认为首页通知公告',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `| 类型 | 参数 | 说明 |
| ---- | ---- | ---- |
| 通知公告 | tzgg | 首页综合通知公告 |
| 学科竞赛 | xkjs | 学科竞赛相关通知公告 |`,
};
