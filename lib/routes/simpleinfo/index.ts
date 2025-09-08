import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/simpleinfo',
    parameters: { category: '分类名' },
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
            source: ['blog.simpleinfo.cc/blog/:category'],
            target: '/:category',
        },
    ],
    name: '志祺七七',
    maintainers: ['haukeng'],
    handler,
    description: `| 夥伴聊聊 | 專案設計 |
| -------- | -------- |
| work     | talk     |

| 國內外新聞 | 政治百分百 | 社會觀察家 | 心理與哲學            |
| ---------- | ---------- | ---------- | --------------------- |
| news       | politics   | society    | psychology-philosophy |

| 科學大探索 | 環境與健康         | ACG 快樂聊 | 好書籍分享   | 其它主題     |
| ---------- | ------------------ | ---------- | ------------ | ------------ |
| science    | environment-health | acg        | book-sharing | other-topics |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const rootUrl = 'https://blog.simpleinfo.cc';
    const link = `${rootUrl}${category ? (category === 'work' || category === 'talk' ? `/blog/${category}` : `/shasha77?category=${category}`) : '/shasha77'}`;
    const response = await got(link);
    const $ = load(response.data);
    const title = `${$('.-active').text()} - 簡訊設計`;
    $('.-ad').remove();

    const list = $('.article-item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.title').text(),
                link: item.find('a').first().attr('href'),
                category: item.find('.category').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const result = await got(item.link);
                const content = load(result.data);
                item.author = content('meta[property="article:author"]').attr('content');
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('meta[property="og:image"]').attr('content'),
                    description: content('.article-content').first().html(),
                });
                return item;
            })
        )
    );

    return {
        title,
        link,
        language: 'zh-tw',
        item: items,
    };
}
