import { load } from 'cheerio';
import iconv from 'iconv-lite';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'http://news.inewsweek.cn';

export const route: Route = {
    path: '/:channel',
    categories: ['traditional-media'],
    example: '/inewsweek/survey',
    parameters: { channel: '栏目' },
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
            source: ['inewsweek.cn/:channel', 'inewsweek.cn/'],
        },
        ...['cover', 'politics', 'society', 'finance', 'world', 'survey', 'people'].map((channel) => ({
            source: [`news.inewsweek.cn/${channel}`],
            target: `/${channel}`,
        })),
    ],
    name: '栏目',
    maintainers: ['changren-wcr'],
    handler,
    description: `提取文章全文。

| 封面  | 时政     | 社会    | 经济    | 国际  | 调查   | 人物   |
| ----- | -------- | ------- | ------- | ----- | ------ | ------ |
| cover | politics | society | finance | world | survey | people |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const url = `${rootUrl}/${channel}`;
    const response = await got(url, {
        responseType: 'buffer',
    });
    const $ = load(iconv.decode(response.data, 'gbk'));
    const items = await Promise.all(
        $('div.grid-item')
            .toArray()
            .map(async (item) => {
                const $item = $(item);
                const href = $item.find('a').attr('href');
                const articleLink = `${rootUrl}${href}`;
                const detail = await cache.tryGet(articleLink, async () => {
                    const response = await got(articleLink, {
                        responseType: 'buffer',
                    });

                    const $ = load(iconv.decode(response.data, 'gbk'));
                    const fullText = $('div.contenttxt').html();
                    const editor = $('div.editor').text();
                    const published = editor.match(/\b\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\b/)?.[0];
                    const author = published ? editor.slice(0, editor.indexOf(published)).trim() || undefined : undefined;
                    const date = published ? parseDate(published, 'YYYY-MM-DD HH:mm:ss', true) : undefined;
                    const time = date && Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
                    return {
                        description: fullText,
                        author,
                        pubDate: time,
                    };
                });
                return { ...detail, title: $item.find('p').text(), link: articleLink };
            })
    );

    return {
        title: $('title').text(),
        link: url,
        item: items,
    };
}
