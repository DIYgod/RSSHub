import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://jwc.ecust.edu.cn';
const categoryMap = {
    mto: { link: '/3938', name: '教学运行管理' },
    mttb: { link: '/3939', name: '培养与教学建设管理' },
    gi: { link: '/zhglbgs', name: '综合信息' },
    mpt: { link: '/3940', name: '实践教学管理' },
    fai: { link: '/3941', name: '学院教务信息' },
};
const getFromLink = async (link) => {
    const { data: response } = await got(link);
    const $ = load(response);
    const articleList = $('div#wp_news_w2 table[width="100%"]')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const a = $(item).find('a');
            const date = $(item).find('div[style="white-space:nowrap"]').first();
            const dateText = date.text();
            const pubDate = dateText ? timezone(parseDate(dateText), 8) : undefined;
            // deal with article_link
            let articleLink = a.attr('href');
            if (!articleLink!.startsWith('http')) {
                articleLink = `${baseUrl}${articleLink}`;
            }
            articleLink = articleLink!
                .replace(/^https:\/\/(\w+)-ecust-edu-cn-s\.sslvpn\.ecust\.edu\.cn:8118/, 'https://$1.ecust.edu.cn')
                .replace(/^https:\/\/ecust-edu-cn-s\.sslvpn\.ecust\.edu\.cn:8118/, 'https://ecust.edu.cn')
                .replace(/^https:\/\/mp-weixin-qq-com-s\.sslvpn\.ecust\.edu\.cn:8118/, 'https://mp.weixin.qq.com');
            return {
                title: a.text(),
                link: articleLink,
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            };
        });
    return articleList;
};
export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/ecust/jwc/mto',
    parameters: { category: '订阅板块，默认为全部订阅' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '本科教务处信息网',
    maintainers: ['lxl66566'],
    handler,
    description: `| 其他任意值 | mto          | mttb               | gi       | mpt          | fai          |
| ---------- | ------------ | ------------------ | -------- | ------------ | ------------ |
| 全部订阅   | 教学运行管理 | 培养与教学建设管理 | 综合信息 | 实践教学管理 | 学院教务信息 |`,
};

async function handler(ctx) {
    const { category = 'all' } = ctx.req.param();
    const categoryItem = Object.hasOwn(categoryMap, category) ? categoryMap[category] : undefined;
    const pageUrl = categoryItem ? [`${baseUrl}${categoryItem.link}/list.htm`] : Object.values(categoryMap).map((item) => `${baseUrl}${item.link}/list.htm`);
    const items = (await pMap(pageUrl, getFromLink, { concurrency: 3 })).flat();
    const result = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const content = load(response);
                const article = content('div.wp_articlecontent, #js_content');
                article.find('script, style').remove();
                article.find('[pdfsrc]').each((_, element) => {
                    const pdfUrl = content(element).attr('pdfsrc');
                    if (pdfUrl) {
                        content(element).replaceWith(content('<a>').attr('href', new URL(pdfUrl, item.link).href).text('PDF'));
                    }
                });
                article.find('img[data-src]').each((_, element) => {
                    content(element).attr('src', content(element).attr('data-src')!).removeAttr('data-src');
                });
                article.find('[style]').removeAttr('style');
                item.description = article.html() || undefined;
                return item;
            }),
        { concurrency: 3 }
    );
    return {
        title: `华理教务处 - ${categoryItem ? categoryItem.name : '全部'}`,
        link: categoryItem ? pageUrl[0] : baseUrl,
        item: result,
    };
}
