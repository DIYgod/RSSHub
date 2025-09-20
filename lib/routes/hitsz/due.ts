import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const { id = 'tzgg' } = ctx.req.param();
    const fetchPageCount = Number.parseInt(ctx.req.query('fetch_page_count') ?? '5', 10);
    const finalLimit = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl = 'http://due.hitsz.edu.cn';

    // 根据 id 构建基础路径
    const baseListPath = id === 'tzgg' || id === 'jwdt' ? `index/${id}qb` : id;

    // --- 步骤 1: 获取所有需要抓取的页面URL ---
    const pageUrls = [];
    // 第一页 URL
    pageUrls.push(new URL(`${baseListPath}.htm`, baseUrl).href);

    // 获取后续页面的 URL
    try {
        const firstPageResponse = await got(pageUrls[0]);
        const $ = load(firstPageResponse.data);
        let currentNumericalPageId = null;

        $(' .fenye a, .pages a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                const match = href.match(/\/(\d+)\.htm$/);
                if (match && match[1]) {
                    const pageNum = Number.parseInt(match[1], 10);
                    if (!Number.isNaN(pageNum)) {
                        currentNumericalPageId = pageNum;
                        return false;
                    }
                }
            }
        });

        if (currentNumericalPageId !== null) {
            for (let i = 0; i < fetchPageCount - 1; i++) {
                if (currentNumericalPageId <= 0) {
                    break;
                }
                pageUrls.push(new URL(`${baseListPath}/${currentNumericalPageId}.htm`, baseUrl).href);
                currentNumericalPageId--;
            }
        }
    } catch {
        // 无法获取第一页的翻页信息，只处理第一页
    }

    // --- 步骤 2: 并发抓取所有页面的列表 ---
    const pagePromises = pageUrls.map((url) => got(url).catch(() => null));
    const pageResponses = await Promise.all(pagePromises);

    const detailPromises = [];

    for (const response of pageResponses) {
        if (!response) {
            continue;
        } // 忽略失败的请求

        const $ = load(response.data);
        // 使用原来的选择器
        const listItemsOnPage = $('ul.list-main-modular li, .list-main-modular-text-list li').toArray();

        for (const el of listItemsOnPage) {
            const $el = $(el);
            const linkUrl = $el.find('a').attr('href');
            if (!linkUrl) {
                continue;
            }

            const title = $el.find('span.text-over, a').text().trim();
            const pubDateStr = $el.find('label').text().trim();

            const item = {
                title,
                link: new URL(linkUrl, baseUrl).href,
                pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : null,
            };

            // 将所有详情页抓取任务放入一个数组
            detailPromises.push(
                cache.tryGet(item.link, async () => {
                    const detailResponse = await got.get(item.link);
                    const $$ = load(detailResponse.data);
                    const detailTitle = $$('h1.arti_title, h2.arti_title, title').text().trim() || item.title;
                    const detailPubDateStr = $$('span.arti_update, .publish-time, .datetime, .time-style').text().split(/：/).pop()?.trim();
                    const content = $$('div.wp_articlecontent, div.article-content, div.content-info').html();
                    return {
                        ...item,
                        title: detailTitle,
                        description: content,
                        pubDate: detailPubDateStr ? timezone(parseDate(detailPubDateStr), 8) : item.pubDate,
                    };
                })
            );
        }
    }

    // --- 步骤 3: 并发抓取所有文章的详细内容 ---
    const allResolvedItems = (await Promise.all(detailPromises)).filter(Boolean);

    // --- 步骤 4: 对所有收集到的项目进行排序和截取 ---
    allResolvedItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    const filteredItems = allResolvedItems.slice(0, finalLimit);

    // 考虑到页面标题可能无法获取，做一下容错
    const pageTitle = (await got(pageUrls[0])).data
        ? load((await got(pageUrls[0])).data)('title')
              .text()
              .trim()
        : '';

    const author = '哈尔滨工业大学（深圳）教务部';

    return {
        title: `${author} - ${pageTitle}`,
        description: pageTitle,
        link: pageUrls[0],
        item: filteredItems,
        author,
    };
};

// 保持 route 定义不变，它是正确的
export const route: Route = {
    path: '/due/:id?',
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

如需获取教务学务所有栏目的新闻汇总，请使用 [\`/hitsz/jwxw\`](https://rsshub.app/hitsz/jwxw) 路由。

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
