import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootURL = 'http://jwch.usts.edu.cn/index';

class ArticleAccessError extends Error {}

export const route: Route = {
    path: '/jwch/:type?',
    categories: ['university'],
    example: '/usts/jwch',
    parameters: { type: '类型，默认为教务动态' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['Fatpandac'],
    handler,
    description: `| 类型 | 教务动态 | 公告在线 | 选课通知 |
| ---- | -------- | -------- | -------- |
|      | jwdt     | ggzx     | xktz     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'jwdt';
    const url = `${rootURL}/${type}.htm`;
    const response = await got(url);

    const $ = load(response.data);
    const title = $('div.mainWrap.cleafix > div > div.right.fr > div.local.fl > h3').text();
    const list = $('div.list > ul > li')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href')!, rootURL).href,
            pubDate: parsePublicationDate(
                $(item)
                    .find('i')
                    .text()
                    .match(/\d{4}年\d{2}月\d{2}日/)?.[0]
            ),
        }));

    const items = await pMap(
        list,
        async (item) => {
            try {
                const details = await cache.tryGet<Pick<DataItem, 'description' | 'author' | 'pubDate'>>(`usts:article-details:v2:${item.link!}`, async () => {
                    const detailResponse = await got(item.link);
                    const content = load(detailResponse.data);
                    const description = content('div#vsb_content').html();
                    if (description === null) {
                        if (/window\.location\.href\s*=\s*['"]https:\/\/sso\.usts\.edu\.cn\/oauth2\.0\/authorize\?/.test(content('script').text())) {
                            throw new ArticleAccessError('This university article requires authentication');
                        }
                        throw new Error('University article body is missing');
                    }

                    let author: string | null = null;
                    let pubDate: string | null = null;
                    for (const item of content('div.content-title.fl > i').text().split('\u{A0}\u{A0}')) {
                        if (item.startsWith('作者：')) {
                            author = item.split('：', 2)[1];
                        }
                        if (item.includes('时间：')) {
                            pubDate = item.split('：', 2)[1];
                        }
                    }

                    return {
                        description,
                        author: author ?? undefined,
                        pubDate: parsePublicationDate(pubDate ?? undefined),
                    };
                });
                return {
                    ...item,
                    description: details.description,
                    author: details.author,
                    pubDate: details.pubDate ?? item.pubDate,
                };
            } catch (error) {
                if (error instanceof ArticleAccessError) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: `苏州科技大学 教务处 - ${title}`,
        link: url,
        item: items,
    };
}

function parsePublicationDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value, ['YYYY-MM-DD HH:mm:ss', 'YYYY年MM月DD日'], true);
    if (!Number.isNaN(date.getTime())) {
        return timezone(date, 8);
    }
}
