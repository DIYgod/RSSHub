import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const fetchPageCount = Number.parseInt(ctx.req.query('fetch_page_count') ?? '5', 10);
    const finalLimit = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl = 'http://due.hitsz.edu.cn';

    // 根据 id 构建基础路径
    const baseListPath = `index/tzggqb`;

    // --- 步骤 1: 获取所有需要抓取的页面URL ---
    const pageUrls = [];
    // 第一页 URL
    pageUrls.push(new URL(`${baseListPath}.htm`, baseUrl).href);

    // 1. 修复：显式初始化变量为 null，指定类型（避免隐式 undefined）
    let firstPageResponse: Awaited<ReturnType<typeof got>> | null = null;
    // 获取后续页面的 URL
    try {
        firstPageResponse = await got(pageUrls[0]);
        // 2. 修复：首次访问 data 前增加空值检查（核心防错逻辑）
        if (!firstPageResponse) {
            throw new Error('Failed to get valid response for first page');
        }
        const $ = load(firstPageResponse.data);

        // 解析页面上的翻页链接
        const pageLinks = new Set();

        // 查找所有分页链接
        $('.p_no a, .p_next a, .p_last a').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                // 确保相对路径正确转换为完整URL
                const fullHref = href.startsWith('http') ? href : `index/${href}`;
                const fullUrl = new URL(fullHref, baseUrl).href;
                pageLinks.add(fullUrl);
            }
        });

        // 添加找到的页面链接
        const additionalUrls = [...pageLinks];
        for (let i = 0; i < Math.min(fetchPageCount - 1, additionalUrls.length); i++) {
            pageUrls.push(additionalUrls[i]);
        }
    } catch {
        // 捕获错误时，firstPageResponse 保持为 null（无需额外赋值）
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

        // 修改：将 for 循环 push 改为 map 生成数组（PR评论要求：Use map instead of push）
        const pageItems = listItemsOnPage
            .map((el) => {
                const $el = $(el);
                const linkUrl = $el.find('a').attr('href');
                if (!linkUrl) {
                    return null;
                } // 过滤无链接项

                const title = $el.find('span.text-over, a').text().trim();
                const pubDateStr = $el.find('label').text().trim();

                return {
                    title,
                    link: new URL(linkUrl, baseUrl).href,
                    pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : null,
                    description: title, // 使用标题作为描述
                };
            })
            .filter(Boolean); // 过滤 null 项

        detailPromises.push(...pageItems); // 展开数组添加到承诺列表
    }

    // --- 步骤 3: 并发抓取所有文章的详细内容 ---
    const allResolvedItems = (await Promise.all(detailPromises)).filter(Boolean);

    // --- 步骤 4: 对所有收集到的项目进行排序和截取 ---
    allResolvedItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    const filteredItems = allResolvedItems.slice(0, finalLimit);

    // 考虑到页面标题可能无法获取，做一下容错
    // 修改：复用 firstPageResponse，避免重复请求（性能优化）
    // 保留原空值检查，补充默认标题（更友好）
    const pageTitle = firstPageResponse ? load(firstPageResponse.data)('title').text().trim() : '哈尔滨工业大学（深圳）教务部通知公告';

    const author = '哈尔滨工业大学（深圳）教务部';

    return {
        title: `${author} - ${pageTitle}`,
        description: pageTitle,
        link: pageUrls[0],
        item: filteredItems,
        author,
    };
};

// 保持 route 定义不变，它是正确的（仅修改参数相关问题）
export const route: Route = {
    path: '/due/tzgg',
    name: '教务部',
    url: 'due.hitsz.edu.cn',
    maintainers: ['guohuiyuan'],
    handler,
    example: '/hitsz/due/tzgg',
    // 修改：删除无效的 category 参数（PR评论指出：path无参数占位符，参数定义无效）
    parameters: {},
    description: `:::tip
订阅 [通知公告](http://due.hitsz.edu.cn/index/tzggqb.htm)，其源网址为 \`http://due.hitsz.edu.cn/index/tzggqb.htm\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/hitsz/due/tzgg\`](https://rsshub.app/hitsz/due/tzgg)。
:::
如需获取教务学务和学位管理所有栏目的新闻汇总，请使用 [\`/hitsz/due/general\`](https://rsshub.app/hitsz/due/general) 路由。

<details>
<summary>更多栏目</summary>

| 栏目 | ID |
| - | - |
| [通知公告](http://due.hitsz.edu.cn/index/tzggqb.htm) | [tzgg](https://rsshub.app/hitsz/due/tzgg) |

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
    ],
};
