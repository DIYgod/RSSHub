import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://cyxy.xtu.edu.cn/';
const host = 'cyxy.xtu.edu.cn';

const handler: Route['handler'] = async (ctx) => {
    const type = ctx.req.param('type') ?? 'dxscxcyxljhxm';
    const typeDict = {
        dxscxcyxljhxm: ['大学生创新创业训练计划', 'scsj/dxscxcyxljhxm.htm'],
        scjs: ['双创竞赛', 'scsj/scjs/zggjdxscxds1.htm'],
    };

    if (!typeDict[type]) {
        throw new Error(`Invalid type: ${type}`);
    }

    const listUrl = `${rootUrl}${typeDict[type][1]}`;

    const response = await ofetch(listUrl);
    const $ = load(response);

    const list = $('.common-list li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $a = $item.find('a').first();

            let title = $a.attr('title') || $item.find('h2.ellipsis').text() || $a.text() || '';
            let link = $a.attr('href') || '';

            // 处理相对路径
            if (link && !link.startsWith('http')) {
                if (link.startsWith('../')) {
                    link = rootUrl + link.replace(/\.\.\//g, '');
                } else if (link.startsWith('./')) {
                    link = rootUrl + link.replace(/\.\//g, '');
                } else if (link.startsWith('/')) {
                    link = rootUrl.slice(0, -1) + link;
                } else {
                    link = rootUrl + link;
                }
            }

            // 从 date 结构中提取日期 (格式: <h3>10</h3><p>2026.02</p>)
            const $dateH3 = $item.find('.date h3');
            const $dateP = $item.find('.date p');
            let pubDate: Date | undefined;
            if ($dateH3.length && $dateP.length) {
                const day = $dateH3.text().trim();
                const yearMonth = $dateP.text().trim().replace('.', '-');
                const dateText = `${yearMonth}-${day}`;
                pubDate = timezone(parseDate(dateText), +8);
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
        title: `湘潭大学创新创业学院 - ${typeDict[type][0]}`,
        link: listUrl,
        item: items,
    };
};

export const route: Route = {
    name: '创新创业学院',
    path: '/cyxy/:type?',
    example: '/xtu/cyxy/dxscxcyxljhxm',
    url: 'cyxy.xtu.edu.cn',
    handler,
    categories: ['university'],
    maintainers: ['zzy00747'],
    parameters: {
        type: '栏目类型，见下表，默认为大创项目',
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
| 大创项目 | dxscxcyxljhxm | 大学生创新创业训练计划项目 |
| 双创竞赛 | scjs | 双创竞赛（互联网+、挑战杯等） |`,
};
