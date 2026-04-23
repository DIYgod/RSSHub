import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Route } from '@/types';

const rootUrl = 'https://nic.xtu.edu.cn/';
const host = 'nic.xtu.edu.cn';

const handler: Route['handler'] = async (ctx) => {
    const type = ctx.req.param('type') ?? 'dt';
    const typeDict = {
        dt: ['新闻动态', 'index/dt.htm'],
        tzgg: ['通知公告', 'wldt/tzgg.htm'],
    };

    if (!typeDict[type]) {
        throw new Error(`Invalid type: ${type}`);
    }

    const listUrl = `${rootUrl}${typeDict[type][1]}`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const list = $('.detail-main-list-ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $a = $item.find('a').first();
            const $span = $item.find('span').last();

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
                        const contentSelectors = ['.v_news_content', '.content-detail', '.article-content', '.wp_articlecontent', '#main-content', '.content', '.news-content'];

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
        title: `湘潭大学网络与信息中心 - ${typeDict[type][0]}`,
        link: listUrl,
        item: items,
    };
};

export const route: Route = {
    name: '网络与信息中心',
    path: '/nic/:type?',
    example: '/xtu/nic/dt',
    url: 'nic.xtu.edu.cn',
    handler,
    categories: ['university'],
    maintainers: ['zzy00747'],
    parameters: {
        type: '栏目类型，见下表，默认为新闻动态',
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
| 新闻动态 | dt | 中心新闻动态 |
| 通知公告 | tzgg | 网络动态通知公告 |`,
};
