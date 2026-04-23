import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Route } from '@/types';

const rootUrl = 'https://www.xtu.edu.cn/';
const host = 'www.xtu.edu.cn';

const handler: Route['handler'] = async (ctx) => {
    const type = ctx.req.param('type') ?? 'tzgg';
    const typeDict = {
        tzgg: ['通知公告', 'index/tzgg.htm'],
        xdw: ['湘大新闻', 'index/xdw.htm'],
    };

    if (!typeDict[type]) {
        throw new Error(`Invalid type: ${type}`);
    }

    const listUrl = `${rootUrl}${typeDict[type][1]}`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const list = $('.list_rg li, .list_lb li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $a = $item.find('a').first();
            const $span = $item.find('span').first();

            let title = $a.attr('title') || $item.find('h2').text() || $a.text() || '';
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

            // 日期格式: 2026.04.17
            const dateText = $span.text().trim().replace(/\./g, '-');
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
        title: `湘潭大学官网 - ${typeDict[type][0]}`,
        link: listUrl,
        item: items,
    };
};

export const route: Route = {
    name: '学校官网',
    path: '/www/:type?',
    example: '/xtu/www/tzgg',
    url: 'www.xtu.edu.cn',
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
| 通知公告 | tzgg | 学校通知公告 |
| 湘大新闻 | xdw | 湘大新闻动态 |`,
};
