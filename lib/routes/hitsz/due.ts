import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    // 使用默认值来避免 undefined，并确保类型正确
    const { id = 'tzgg' } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl = 'http://due.hitsz.edu.cn';
    const targetUrl;

    // 优化 URL 拼接逻辑，更清晰且易于维护
    targetUrl = id === 'tzgg' || id === 'jwdt' ? new URL(`index/${id}qb.htm`, baseUrl).href : new URL(`${id}/list.htm`, baseUrl).href;

    const response = await got(targetUrl);
    const $ = load(response.data);

    // 提取新闻列表项，使用更健壮的选择器
    const list = $('ul.list-main-modular li, .list-main-modular-text-list li').slice(0, limit).toArray();

    // 过滤掉链接不完整的项目，提高数据质量
    const items = await Promise.all(
        list.map((el) => {
            const $el = $(el);
            const linkUrl = $el.find('a').attr('href');

            // 确保链接存在且有效
            if (!linkUrl) {
                return null;
            }

            const title = $el.find('span.text-over, a').text().trim();
            const pubDateStr = $el.find('label').text().trim();

            const item = {
                title,
                link: new URL(linkUrl, baseUrl).href,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : null,
            };

            return cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const $$ = load(detailResponse.data);

                // 尝试从多种选择器中提取标题和发布日期
                const detailTitle = $$('h1.arti_title, h2.arti_title, title').text().trim() || item.title;
                const detailPubDateStr = $$('span.arti_update, .publish-time, .datetime, .time-style').text().split(/：/).pop()?.trim();
                const content = $$('div.wp_articlecontent, div.article-content, div.content-info').html();

                return {
                    ...item,
                    title: detailTitle,
                    description: content,
                    // 如果详细页日期解析成功，则更新，否则保持列表页的日期
                    pubDate: detailPubDateStr ? timezone(parseDate(detailPubDateStr), 8) : item.pubDate,
                };
            });
        })
    );

    // 过滤掉所有返回 null 的项目
    const filteredItems = items.filter(Boolean);

    const pageTitle = $('title').text();
    const author = '哈尔滨工业大学（深圳）教务部';

    return {
        title: `${author} - ${pageTitle}`,
        description: pageTitle,
        link: targetUrl,
        item: filteredItems,
        // 移除 allowEmpty，如果列表抓取失败，将抛出错误
        author,
    };
};

// 保持 route 导出不变，因为它定义了路由和元数据
export const route: Route = {
    path: '/hitsz/due/:id?',
    name: '教务部',
    url: 'due.hitsz.edu.cn',
    maintainers: ['guohuiyuan'],
    handler,
    example: '/hitsz/due/tzgg',
    parameters: {
        category: {
            description: '分类，默认为 `tzgg`，即通知公告，可在对应分类页 URL 中找到',
            options: [
                {
                    label: '通知公告',
                    value: 'tzgg',
                },
                {
                    label: '教务动态',
                    value: 'jwdt',
                },
            ],
        },
    },
    description: `:::tip
订阅 [通知公告](http://due.hitsz.edu.cn/index/tzggqb.htm)，其源网址为 \`http://due.hitsz.edu.cn/index/tzggqb.htm\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/hitsz/due/tzgg\`](https://rsshub.app/hitsz/due/tzgg)。
:::

<details>
  <summary>更多栏目</summary>

| 栏目 | ID |
| - | - |
| [通知公告](http://due.hitsz.edu.cn/index/tzggqb.htm) | [tzgg](https://rsshub.app/hitsz/due/tzgg) |
| [教务动态](http://due.hitsz.edu.cn/index/jwdtqb.htm) | [jwdt](https://rsshub.app/hitsz/due/jwdt) |

</details>
`,
    categories: ['university'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['due.hitsz.edu.cn', 'due.hitsz.edu.cn/index/:id/list.htm'],
            target: (params) => {
                const id = params.id;
                return `/hitsz/due${id ? `/${id}` : ''}`;
            },
        },
        {
            title: '通知公告',
            source: ['due.hitsz.edu.cn/index/tzggqb.htm'],
            target: '/hitsz/due/tzgg',
        },
        {
            title: '教务动态',
            source: ['due.hitsz.edu.cn/index/jwdtqb.htm'],
            target: '/hitsz/due/jwdt',
        },
    ],
};
