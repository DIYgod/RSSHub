import { load } from 'cheerio';
import { html } from 'hono/html';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parsePublicationDate(value?: string) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

export const handler = async () => {
    const baseUrl = 'http://due.hitsz.edu.cn';
    const baseListPath = 'index/tzggqb';

    // 只抓取第一页
    const firstPageUrl = new URL(`${baseListPath}.htm`, baseUrl).href;

    const response = await got(firstPageUrl);

    const $ = load(response.data);

    // 获取页面标题
    const pageTitle = $('title').text().trim() || '哈尔滨工业大学（深圳）教务部通知公告';
    const author = '哈尔滨工业大学（深圳）教务部';

    // 解析第一页的文章列表
    const listItems = $('ul.list-main-modular li').toArray();

    const items = listItems
        .map((el) => {
            const $el = $(el);
            const linkUrl = $el.find('a').attr('href');
            if (!linkUrl) {
                return null;
            }

            const title = $el.find('span').text().trim();
            const pubDateStr = $el.find('label').text();

            return {
                title,
                link: new URL(linkUrl, baseUrl).href,
                pubDate: parsePublicationDate(pubDateStr),
            };
        })
        .filter((item) => item !== null);

    const detailedItems = await pMap(
        items,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const content = $('.v_news_content').html() ?? $('.wp_articlecontent').html() ?? '';
                const attachments = $('.page-main-fj a[href]')
                    .toArray()
                    .filter((element) => $(element).attr('href'))
                    .map((element) => String(html`<p><a href="${new URL($(element).attr('href')!, item.link).href}">${$(element).text()}</a></p>`))
                    .join('');
                return { description: content + attachments || undefined };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: `${author} - ${pageTitle}`,
        description: pageTitle,
        link: firstPageUrl,
        item: detailedItems,
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
    description: `::: tip
订阅 [通知公告](http://due.hitsz.edu.cn/index/tzggqb.htm)，其源网址为 \`http://due.hitsz.edu.cn/index/tzggqb.htm\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/hitsz/due/tzgg\`](https://rsshub.app/hitsz/due/tzgg)。
:::
如需获取教务学务和学位管理所有栏目的新闻汇总，请使用 [\`/hitsz/due/general\`](https://rsshub.app/hitsz/due/general) 路由。

<details>
<summary>更多栏目</summary>

| 栏目                                                 | ID                                        |
| ---------------------------------------------------- | ----------------------------------------- |
| [通知公告](http://due.hitsz.edu.cn/index/tzggqb.htm) | [tzgg](https://rsshub.app/hitsz/due/tzgg) |

</details>`,
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
            source: ['due.hitsz.edu.cn', 'due.hitsz.edu.cn/index.htm'],
            target: '/due/tzgg',
        },
        {
            title: '通知公告',
            source: ['due.hitsz.edu.cn/index/tzggqb.htm'],
            target: '/due/tzgg',
        },
    ],
};
