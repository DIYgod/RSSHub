import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/realtime/:category?',
    categories: ['new-media'],
    example: '/nextapple/realtime/latest',
    parameters: { category: '類別，見下表，默認為首頁' },
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
            source: ['tw.nextapple.com/', 'tw.nextapple.com/realtime/:category'],
        },
    ],
    name: '最新新聞',
    maintainers: ['miles170'],
    handler,
    url: 'tw.nextapple.com/',
    description: `| 首頁   | 焦點      | 熱門 | 娛樂          | 生活 | 女神     | 社會  |
| ------ | --------- | ---- | ------------- | ---- | -------- | ----- |
| latest | recommend | hit  | entertainment | life | gorgeous | local |

| 政治     | 國際          | 財經    | 體育   | 旅遊美食  | 3C 車市 |
| -------- | ------------- | ------- | ------ | --------- | ------- |
| politics | international | finance | sports | lifestyle | gadget  |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'latest';
    const currentUrl = `https://tw.nextapple.com/realtime/${category}`;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const items = await pMap(
        $('article.infScroll').toArray(),
        (item) => {
            const link = $(item).find('.post-title').attr('href');
            return cache.tryGet(`${link}:article-content`, async () => {
                const response = await got(link);
                const $ = load(response.data);
                const mainContent = $('#main-content');
                const titleElement = mainContent.find('header h1');
                const title = titleElement.text();
                titleElement.remove();
                const postMetaElement = mainContent.find('.post-meta');
                const category = mainContent.find('header .breadcrumb li').last().text();
                const publishedAt = $('meta[property="article:published_time"]').attr('content');
                const pubDate = publishedAt ? parseDate(publishedAt) : undefined;
                postMetaElement.remove();
                const article = $('.article-body').first();
                const introduction = article
                    .children('header')
                    .children('blockquote, figure, video, iframe, div:has(video), div:has(iframe)')
                    .not('.post-meta, .post-title')
                    .toArray()
                    .map((element) => $.html(element))
                    .join('');
                const description = introduction + (article.children('.post-content').html() || '');

                return {
                    title,
                    author: $('meta[name="author"]').attr('content') || undefined,
                    description,
                    category,
                    pubDate,
                    link,
                };
            });
        },
        { concurrency: 5 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
