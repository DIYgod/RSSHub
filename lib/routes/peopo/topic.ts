import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://www.peopo.org';

export const route: Route = {
    path: '/topic/:topicId?',
    categories: ['new-media'],
    example: '/peopo/topic/159',
    parameters: { topicId: '分類 ID，見下表；保留既有預設值 159，目前對應坪林區' },
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
            source: ['peopo.org/topic/:topicId'],
            target: '/topic/:topicId',
        },
    ],
    name: '新聞分類',
    maintainers: ['TonyRL'],
    handler,
    description: `預設值及範例保留為 \`159\`，目前對應坪林區。網站現行新聞分類如下：

| 分類     | ID |
| -------- | -- |
| 社會關懷 | 2  |
| 生態環保 | 3  |
| 文化古蹟 | 4  |
| 社區改造 | 5  |
| 教育學習 | 6  |
| 農漁畜牧 | 7  |
| 生活休閒 | 8  |
| 媒體觀察 | 9  |
| 運動科技 | 10 |
| 政治經濟 | 11 |`,
};

async function handler(ctx) {
    const { topicId = '159' } = ctx.req.param();
    const url = `${baseUrl}/topic/${topicId}`;
    const response = await got(url);
    const $ = load(response.data);
    const list = $('main .view-content > .views-row')
        .toArray()
        .map((row): DataItem & { link: string } => {
            const $row = $(row);
            const anchor = $row.find('.views-field-title h3 a');
            return {
                title: anchor.text(),
                link: new URL(anchor.attr('href')!, baseUrl).href,
                author: $row.find('.username a').text(),
                pubDate: parseDate($row.find('time[datetime]').attr('datetime')!),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const article = $('article.node--type-post');
                item.category = article
                    .find('.field--name-field-peopo-term .field__item a, .field--name-field-tags .field__item a, .field--name-field-area-term .field__item a')
                    .toArray()
                    .map((tag) => $(tag).text());
                const media = article
                    .find('.field--name-field-video-id video, .field--name-field-video-id iframe')
                    .toArray()
                    .map((element) => $.html(element))
                    .join('');
                const body = article.find('.node__content > .field--name-body').html() ?? '';
                item.description = media + body;
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link: url,
        language: 'zh-TW' as const satisfies Language,
        item: items,
    };
}
