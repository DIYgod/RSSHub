import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/lib/tzgg/:category?',
    categories: ['university'],
    example: '/tsinghua/lib/tzgg',
    parameters: { category: '分类，可在对应分类页 URL 中找到，留空则获取全局通知公告' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['lib.tsinghua.edu.cn/tzgg/:category', 'lib.tsinghua.edu.cn/tzgg.htm'],
        },
    ],
    name: '图书馆通知公告',
    maintainers: ['linsenwang', 'Aquarius-Situla'],
    handler,
};

async function handler(ctx) {
    /* Determine the target URL based on whether a specific category is requested */
    const { category } = ctx.req.param();
    const host = category ? `https://lib.tsinghua.edu.cn/tzgg/${category}.htm` : 'https://lib.tsinghua.edu.cn/tzgg.htm';
    const response = await ofetch(host);
    const $ = load(response);

    /* Extract the feed title, either the specific category name or the global title */
    const feedTitle = category ? $('.tags .on').text() : '通知公告';

    /* Parse the list of notices and extract metadata for each item */
    const list = $('ul.notice-list li')
        .toArray()
        .filter((item) => $(item).find('a').attr('href'))
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const title = $item.find('a').text().trim();
            const time = $item.find('.notice-date').text().trim();
            const a = $item.find('a').attr('href');

            const itemCategory = category ? feedTitle : $item.find('.notice-label').text().trim();
            const displayTitle = category ? title : `[${itemCategory}] ${title}`;

            const fullUrl = new URL(a!, host).href;

            return {
                title: displayTitle,
                link: fullUrl,
                pubDate: parseDate(time, 'YYYY-MM-DD'),
                category: itemCategory,
            };
        });

    /* Fetch full article content for each notice using RSSHub's cache mechanism */
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = $('.v_news_content').html() || undefined;

                return item;
            })
        )
    );

    return {
        allowEmpty: true,
        title: '图书馆通知公告 - ' + feedTitle,
        link: host,
        item: items,
    };
}
