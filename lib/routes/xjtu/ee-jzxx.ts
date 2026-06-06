import { load } from 'cheerio';

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
    maintainers: ['riverflows2333', 'jchliao'],
    handler,
    description: `栏目类型

| 主页 | 本科生 | 研究生 | 科研学术 | 采购招标 | 招聘就业 | 行政办公 |
| ---- | ------ | ------ | -------- | -------- | -------- | -------- |
| -    | bks    | yjs    | kyxs     | cgzb     | zpjy     | xzbg     |`,
};

const categoryMap: Record<string, string> = {
    bks: '本科生',
    yjs: '研究生',
    kyxs: '科研学术',
    cgzb: '采购招标',
    zpjy: '招聘就业',
    xzbg: '行政办公',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? ''; // 默认是首页
    const baseUrl = 'https://ee.xjtu.edu.cn';

    const rootUrl = Object.keys(categoryMap).includes(category) ? `${baseUrl}/jzxx/${category}.htm` : `${baseUrl}/jzxx.htm`;

    const response = await got(rootUrl);
    const $ = load(response.data);

    const list = $('.list ul li')
        .toArray()
        .map((element) => {
            const item = $(element);
            const a = item.find('a');
            const h3 = a.find('h3');
            const title = h3.length > 0 ? h3.text() : a.text();
            const href = a.attr('href');
            if (!href) {
                return null;
            }
            const dateText = item.find('span').first().text().trim();

            return {
                title,
                link: new URL(href, rootUrl).href,
                guid: new URL(href, rootUrl).href,
                pubDate: dateText ? timezone(parseDate(dateText), +8) : undefined,
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    // 2. 异步获取全文内容并执行错误隔离
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const res = await got(item.link);
                    const content = load(res.data);
                    const infoDiv = content('.art-tit, .cont-tit');
                    if (infoDiv.length > 0) {
                        const detailDateText = infoDiv.find('p span').first().text().replace('发布时间：', '').trim();
                        if (detailDateText) {
                            item.pubDate = timezone(parseDate(detailDateText), +8);
                        }
                    }
                    const descriptionBlock = content('.art-body, .v_news_content');
                    if (descriptionBlock.length > 0) {
                        // Clean up download count text from attachments
                        descriptionBlock.find('ul li').each((_, el) => {
                            const $li = content(el);
                            const html = $li.html() ?? '';
                            const cleanedHtml = html.replaceAll(/已下载[\s\S]*?<\/span>次/g, '').replace(/<\/a>\s*$/, '</a>');
                            $li.html(cleanedHtml);
                        });

                        item.description = descriptionBlock.html() || '无内容';
                    } else {
                        item.description = '内容格式有变或需要权限访问，请点击原文查看';
                    }
                } catch {
                    // Fallback: don't affect other articles
                    item.description = '获取详情页失败';
                }

                return item;
            })
        )
    );

    return {
        title: `西安交通大学电气学院通知 - ${categoryMap[category] || '通知首页'}`,
        link: rootUrl,
        item: items,
    };
}
