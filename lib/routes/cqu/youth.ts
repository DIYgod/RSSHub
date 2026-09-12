import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/youth/:category',
    categories: ['university'],
    example: '/cqu/youth/tzdt',
    parameters: { category: '分类名' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    name: '校团委',
    maintainers: ['Hagb'],
    handler,
    description: `| 通知动态 | 院系风采 | 信息公示 | 文件转载 |
| -------- | -------- | -------- | -------- |
| tzdt     | yxfc     | xxgs     | wjzz     |`,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();

    const url = `https://youth.cqu.edu.cn/index/${category}.htm`;
    const { page, destroy } = await getPlaywrightPage(url, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                ['document', 'script'].includes(route.request().resourceType()) ? route.continue() : route.abort();
            });
        },
        gotoConfig: { waitUntil: 'networkidle' },
    });
    const cookies = await page.context().cookies();
    const cookie = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const response = await page.content();
    await destroy();

    const $ = load(response);

    const links = $('.nwes_list a[target=_blank]')
        .toArray()
        .map((item) => ({
            title: item.attribs.title,
            link: new URL(item.attribs.href, url).href,
        }));

    const items = await Promise.all(
        links.map(({ title, link }) =>
            cache.tryGet(link, async () => {
                const detailResponse = await ofetch(link, {
                    headers: {
                        Cookie: cookie,
                        Referer: url,
                    },
                });
                const $detail = load(detailResponse);
                const newsContent = $detail('form[name=_newscontent_fromname]');

                const [dateText, authorText] = newsContent
                    .find('div[align=center]')
                    .text()
                    .split(/\u{A0}+/u, 2); // &nbsp;-separated

                const newsText = newsContent.find('div[class=v_news_content]');
                const attedText = newsText.parent().nextAll().filter('ul[style="list-style-type:none;"]');

                return {
                    title,
                    link,
                    pubDate: timezone(parseDate(dateText), 8),
                    author: authorText?.startsWith('拟稿人：') ? authorText.slice(4) : undefined,
                    description: newsText.html() + $detail.html(attedText),
                };
            })
        )
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
