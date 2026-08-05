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
            source: ['qhfz.edu.cn/:category.htm'],
        },
    ],
    name: '清华大学附属中学',
    maintainers: ['Aquarius-Situla'],
    handler,
    description: `
| 通知公告 | 学生活动 | 教师风采 | 新闻动态 |
| -------- | -------- | -------- | -------- |
| tzgg     | xstd     | jsfc     | xwdt     |
`,
};

async function handler(ctx: Context) {
    /* Determine the target URL based on the provided category */
    const category = ctx.req.param('category') || 'tzgg';
    const host = 'https://www.qhfz.edu.cn';
    const targetUrl = \`\${host}/\${category}.htm\`;

    const response = await ofetch(targetUrl);
    const $ = load(response);

    /* Locate the list of articles on the specific category page */
    let list = $('li:has(a p.bt)');
    // If the layout differs slightly on other pages, fallback to targeting any a with a date sibling.
    if (list.length === 0) {
        list = $('li:has(a)');
    }

    /* Extract metadata (title, link, date) for each article */
    const items = list.toArray().map((item): DataItem & { link: string } => {
        const $item = $(item);
        const $a = $item.find('a').first();
        
        let title = $item.find('p.bt').text().trim();
        if (!title) {
            title = $a.attr('title') || $a.text().trim();
        }

        let time = $item.find('p.sj').text().trim();
        if (!time) {
            // fallback if date class differs
            time = $item.find('.sj').text().trim() || $item.find('.date').text().trim();
        }

        const link = $a.attr('href');

        return {
            title,
            link: link ? new URL(link, targetUrl).href : '',
            pubDate: time ? timezone(parseDate(time, 'YYYY-MM-DD'), 8) : undefined,
        };
    }).filter((item) => item.link); // Filter out empty links

    const feedTitle = categoryMap[category] || '通知公告';

    /* Fetch full article content using the RSSHub cache mechanism */
    const out = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    
                    const content = $('.v_news_content').html() || $('.content').html() || $('.Article_Content').html() || '';
                    item.description = content || undefined;
                } catch {
                    item.description = undefined;
                }
                return item;
            })
        )
    );

    return {
        title: \`清华附中 - \${feedTitle}\`,
        link: targetUrl,
        item: out as DataItem[],
    };
}
