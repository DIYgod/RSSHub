import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import logger from '@/utils/logger'; // 仅新增日志引入

export const handler = async () => {
    const baseUrl = 'http://due.hitsz.edu.cn';

    // 根据 id 构建基础路径
    const baseListPath = `index/tzggqb`;

    // --- 步骤 1: 获取所有需要抓取的页面URL ---
    const pageUrls = [];
    // 第一页 URL
    pageUrls.push(new URL(`${baseListPath}.htm`, baseUrl).href);

    // 修复：将变量声明移至外部，但初始化逻辑不变
    let firstPageResponse: Awaited<ReturnType<typeof got>> | null = null;
    let $firstPage: ReturnType<typeof load> | null = null;

    // 获取后续页面的 URL
    try {
        firstPageResponse = await got(pageUrls[0]);
        // 修复：仅在获取到有效响应时才加载 Cheerio
        if (firstPageResponse) {
            $firstPage = load(firstPageResponse.data); // 仅加载一次
        }
    } catch (error) {
        logger.error(`获取第一页失败: ${error.message}`);
    }

    // 核心修改：使用一个 if 块包裹所有对 $firstPage 的操作，确保其非空
    if ($firstPage) {
        // 解析页面上的翻页链接
        const pageLinks = new Set();
        // 查找所有分页链接
        $firstPage('.p_no a, .p_next a, .p_last a').each((_, el) => {
            const href = $firstPage(el).attr('href'); // 此处 $firstPage 保证非空
            if (href) {
                const fullHref = href.startsWith('http') ? href : `index/${href}`;
                const fullUrl = new URL(fullHref, baseUrl).href;
                pageLinks.add(fullUrl);
            }
        });

        // 添加找到的页面链接
        const additionalUrls = [...pageLinks];
        for (let i = 0; i < Math.min(4, additionalUrls.length); i++) {
            pageUrls.push(additionalUrls[i]);
        }
    }

    // --- 步骤 2: 并发抓取所有页面的列表 ---
    const pagePromises = pageUrls.map(async (url) => {
        try {
            return await got(url);
        } catch (error) {
            logger.error(`获取页面 ${url} 失败: ${error.message}`);
            return null;
        }
    });
    const pageResponses = await Promise.all(pagePromises);

    // 修复：用flatMap替代for循环+push（同步逻辑优化）
    const detailPromises = pageResponses.flatMap((response) => {
        if (!response) {
            return []; // 忽略失败的请求
        }

        const $ = load(response.data);
        // 使用原来的选择器
        const listItemsOnPage = $('ul.list-main-modular li, .list-main-modular-text-list li').toArray();

        // 原map逻辑不变
        return listItemsOnPage
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
    });

    // --- 步骤 3: 获取所有文章的详细内容 ---
    const allResolvedItems = detailPromises.filter(Boolean);

    // 核心修改：pageTitle 声明移到 if 块外面，确保它始终被赋值
    let pageTitle = '哈尔滨工业大学（深圳）教务部通知公告';
    // 修复：安全地使用 $firstPage
    if ($firstPage) {
        pageTitle = $firstPage('title').text().trim();
    }

    const author = '哈尔滨工业大学（深圳）教务部';

    return {
        title: `${author} - ${pageTitle}`,
        description: pageTitle,
        link: pageUrls[0],
        item: allResolvedItems,
        author,
    };
};

// 保持 route 定义完全不变
export const route: Route = {
    path: '/due/tzgg',
    name: '教务部',
    url: 'due.hitsz.edu.cn',
    maintainers: ['guohuiyuan'],
    handler,
    example: '/hitsz/due/tzgg',
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
            target: '/hitsz/due/:id',
        },
        {
            title: '通知公告',
            source: ['due.hitsz.edu.cn/index/tzggqb.htm'],
            target: '/hitsz/due/tzgg',
        },
    ],
};
