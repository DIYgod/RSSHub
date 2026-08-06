import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

/*
 * Dictionary of supported categories.
 * The official website contains additional sections (e.g., recruitment, scientific research) not yet included here.
 * Future maintainers can easily support them by adding their URL prefix (e.g., 'xwdt' for 'xwdt.htm') and title to this map.
 */
const categoryMap: Record<string, string> = {
    tzgg: '通知公告',
    xstd: '学生活动',
    jsfc: '教师风采',
    xwdt: '新闻动态',
};

export const route: Route = {
    path: '/thuhs/:category?',
    categories: ['university'],
    example: '/tsinghua/thuhs/tzgg',
    parameters: { category: '分类，见下表，留空则默认获取通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.qhfz.edu.cn/:category.htm'],
        },
    ],
    name: '清华大学附属中学',
    maintainers: ['Aquarius-Situla'],
    handler,
    description: `
| 通知公告 | 学生活动 | 教师风采 | 新闻动态 |
| -------- | -------- | -------- | -------- |
| tzgg     | xstd     | jsfc     | xwdt     |

:::tip
该网站会屏蔽云服务器/数据中心的 IP（如 GitHub Actions 所使用的 IP 段），但普通家庭或 VPS 网络一般可正常访问。若部署在云函数或 CI 环境中遇到超时，可尝试通过 [gost](https://github.com/go-gost/gost) 等代理工具转发请求。
:::
`,
};

async function handler(ctx: Context) {
    /* Determine the target URL based on the provided category */
    const category = ctx.req.param('category') || 'tzgg';
    const host = 'https://www.qhfz.edu.cn';
    const targetUrl = `${host}/${category}.htm`;

    const response = await ofetch(targetUrl);
    const $ = load(response);

    /* Locate the list of articles on the specific category page */
    const list = $('.list ul li');

    /* Extract metadata (title, link, date) for each article */
    const items = list.toArray().map((item): DataItem & { link: string } => {
        const $item = $(item);
        const $a = $item.find('a');
        const title = $a.attr('title') || $a.text();
        const time = $item.find('.sj').text();
        const link = $a.attr('href');

        return {
            title: title.trim(),
            link: link ? new URL(link, targetUrl).href : '',
            pubDate: time ? timezone(parseDate(time, 'YYYY-MM-DD'), 8) : undefined,
        };
    }).filter((item) => item.link); // Filter out empty links

    const feedTitle = categoryMap[category] || '通知公告';

    /* Fetch full article content using the RSSHub cache mechanism */
    const out = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                item.description = $('.v_news_content').html() || '';
                return item;
            })
        )
    );

    return {
        title: `清华附中 - ${feedTitle}`,
        link: targetUrl,
        item: out as DataItem[],
    };
}
