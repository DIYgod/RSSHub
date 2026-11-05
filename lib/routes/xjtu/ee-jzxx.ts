import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ee/jzxx/:category?',
    categories: ['university'],
    example: '/xjtu/ee/jzxx/bks',
    parameters: {
        category: '类别：`bks`，默认为首页，详情在描述中',
    },
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
            source: ['ee.xjtu.edu.cn/jzxx/:category?.htm'],
        },
    ],
    name: '电气学院通知',
    maintainers: ['riverflows2333'],
    handler,
    description: `栏目类型

| 主页 | 本科生 | 研究生 | 科研学术 | 采购招标 | 招聘就业 | 行政办公 |
| ---- | ------ | ------ | -------- | -------- | -------- | -------- |
| -    | bks    | yjs    | kyxs     | cgzb     | zpjy     | xzbg     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? ''; // Default to the homepage
    const baseUrl = 'https://ee.xjtu.edu.cn';

    const rootUrl = ['bks', 'yjs', 'kyxs', 'cgzb', 'zpjy', 'xzbg'].includes(category) ? `${baseUrl}/jzxx/${category}.htm` : `${baseUrl}/jzxx.htm`;

    const response = await got(rootUrl);
    const $ = load(response.data);

    const list = $('.list .wow.fadeInUp')
        .toArray()
        .map((element) => {
            const item = $(element);
            const a = item.find('a');
            const title = a.text();
            const href = a.attr('href');
            if (!href) {
                return null; // Skip invalid links
            }

            return {
                title,
                link: new URL(href, baseUrl).href,
            };
        })
        .filter((item): item is { title: string; link: string } => item !== null);

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(`xjtu:ee:jzxx:content:v2:${item.link}`, async () => {
                const res = await got(item.link);
                const content = load(res.data);

                const infoDiv = content('div.art-tit.cont-tit');
                const dateText = infoDiv.find('p span:nth-child(1)').text().replace('发布时间：', '').trim();
                const parsedDate = dateText ? parseDate(dateText, /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? 'YYYY-MM-DD' : undefined, true) : undefined;
                const pubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, 8) : undefined;

                const description = content('div.art-body.wow.fadeInUp')
                    .find('ul li') // Select attachment list items
                    .each((_, el) => {
                        const $li = $(el);
                        const newText = $li.html()?.replaceAll(/已下载[\s\S]*?<\/span>次/g, '') ?? '';
                        $li.html(newText.replace(/<\/a>\s*$/, '</a>'));
                    })
                    .end()
                    .html();
                if (!description?.trim()) {
                    throw new Error(`Unable to find article content at ${item.link}`);
                }

                return {
                    title: content('div.art-tit.cont-tit').find('h3').text(),
                    pubDate,
                    link: item.link,
                    guid: item.link,
                    description,
                };
            }),
        { concurrency: 3, stopOnError: false }
    );
    const categoryMap = {
        bks: '本科生',
        yjs: '研究生',
        kyxs: '科研学术',
        cgzb: '采购招标',
        zpjy: '招聘就业',
        xzbg: '行政办公',
    };

    return {
        title: `西安交通大学电气学院通知 - ${categoryMap[category] || '通知首页'}`, // Use the category label with a default fallback
        link: rootUrl,
        item: items,
    };
}
