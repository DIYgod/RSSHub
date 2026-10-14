import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

class ArticleUnavailableError extends Error {}
export const route: Route = {
    path: '/cse/:category?',
    categories: ['university'],
    example: '/zju/cse/bksjy',
    parameters: {
        category: '类别：`bksjy`，默认为简讯专栏，详情在描述中',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '控制学院通知',
    maintainers: ['Rabbits-sys'],
    handler,
    description: `栏目类型

| 简讯专栏 | 本科生教育 | 研究生教育 | 科研学术 | 人事工作 | 学生思政 | 对外交流 | 就业指导 |
| -------- | ---------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| -        | bksjy      | yjsjy      | kyxs     | rsgz     | xssz     | dwjl     | jyzd     |`,
};
async function handler(ctx) {
    const category = ctx.req.param('category') ?? ''; // 默认是首页
    const baseUrl = 'http://www.cse.zju.edu.cn/';
    const categoryMap = {
        bksjy: { title: '本科生教育', tag: '39322' },
        yjsjy: { title: '研究生教育', tag: '39333' },
        kyxs: { title: '科研学术', tag: '39312' },
        rsgz: { title: '人事工作', tag: '39306' },
        xssz: { title: '学生思政', tag: '39342' },
        dwjl: { title: '对外交流', tag: '39353' },
        jyzd: { title: '就业指导', tag: '39351' },
    } as const;
    const rootUrl = Object.keys(categoryMap).includes(category) ? `${baseUrl}/${categoryMap[category].tag}/list.htm` : `${baseUrl}/39283/list.htm`;
    const response = await got(rootUrl);
    const $ = load(response.data);
    const list = $('div.con1rm2rt.xi20')
        .toArray()
        .map((element) => {
            const item = $(element);
            const a = item.find('a');
            const title = a.text();
            const href = a.attr('href');
            // 过滤无效链接与包含 http/https 的绝对链接
            if (!href || /https?:\/\//i.test(href)) {
                return null;
            }
            const resolved = new URL(href, baseUrl).href;
            return {
                title,
                link: resolved,
            };
        })
        .filter(
            (
                item
            ): item is {
                title: string;
                link: string;
            } => item !== null
        );
    const items = await pMap(
        list,
        async (item) => {
            try {
                const details = await cache.tryGet(`zju:cse:details:${item.link}`, async () => {
                    const res = await got(item.link);
                    const content = load(res.data);
                    const article = content('div.wp_articlecontent');
                    if (!article.length) {
                        throw new ArticleUnavailableError('Article content is unavailable; the source may require a campus connection or login.');
                    }
                    const dateText = content('span.xi14')
                        .text()
                        .match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
                    return {
                        description: article.html(),
                        ...(dateText && { pubDate: timezone(parseDate(dateText), 8) }),
                    };
                });
                return { ...item, guid: item.link, ...details };
            } catch (error) {
                if (error instanceof ArticleUnavailableError || error instanceof FetchError) {
                    return { ...item, guid: item.link };
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );
    return {
        title: `浙江大学控制学院通知 - ${categoryMap[category]?.title || '简讯专栏'}`, // 使用对象查找配合默认值
        link: rootUrl,
        item: items,
    };
}
