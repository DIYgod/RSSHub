import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/news_web_easy',
    categories: ['traditional-media'],
    example: '/nhk/news_web_easy',
    parameters: {},
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
            source: ['www3.nhk.or.jp/news/easy/', 'www3.nhk.or.jp/'],
        },
    ],
    name: 'News Web Easy',
    maintainers: ['Andiedie'],
    handler,
    url: 'www3.nhk.or.jp/news/easy/',
};

async function handler(ctx) {
    const data = await ofetch('https://www3.nhk.or.jp/news/easy/news-list.json');
    const dates = data[0];

    let items = Object.values(dates).flatMap((articles) =>
        articles.map((article) => ({
            title: article.title,
            description: art(path.join(__dirname, 'templates/news_web_easy.art'), {
                title: article.title_with_ruby,
                image: article.news_web_image_uri,
            }),
            guid: article.news_id,
            pubDate: timezone(parseDate(article.news_prearranged_time), +9),
            link: `https://www3.nhk.or.jp/news/easy/${article.news_id}/${article.news_id}.html`,
        }))
    );

    items = items.toSorted((a, b) => b.pubDate - a.pubDate).slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const data = await ofetch(item.link);
                const $ = load(data);
                item.description += $('.article-body').html();
                return item;
            })
        )
    );

    return {
        title: 'NEWS WEB EASY',
        link: 'https://www3.nhk.or.jp/news/easy/',
        description: 'NEWS WEB EASYは、小学生・中学生の皆さんや、日本に住んでいる外国人のみなさんに、わかりやすいことば　でニュースを伝えるウェブサイトです。',
        item: items,
    };
}
