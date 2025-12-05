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
            return cache.tryGet(link, async () => {
                const response = await got(link);
                const $ = load(response.data);
                const mainContent = $('#main-content');
                const titleElement = mainContent.find('header h1');
                const title = titleElement.text();
                titleElement.remove();
                const postMetaElement = mainContent.find('.post-meta');
                const category = postMetaElement.find('.category').text();
                const pubDate = parseDate(postMetaElement.find('time').attr('datetime'));
                postMetaElement.remove();
                $('.post-comments').remove();

                return {
                    title,
                    description: mainContent.html(),
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
