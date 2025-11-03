import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/topic/:topic?',
    categories: ['new-media'],
    example: '/ctinews/topic/KDdek5vgXx',
    parameters: {
        topic: '話題 ID，可在 URL 中獲取，留空為 `KDdek5vgXx`',
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
            source: ['ctinews.com/news/topics/:topic', 'ctinews.com'],
        },
    ],
    name: '話題',
    maintainers: ['TonyRL'],
    handler,
    url: 'ctinews.com',
};

async function handler(ctx) {
    const { topic = 'KDdek5vgXx' } = ctx.req.param();
    const baseUrl = 'https://www.ctinews.com';
    const link = `${baseUrl}/news/topics/${topic}`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = [
        ...$('.hero-news__layer .news-link')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.attr('title'),
                    link: $item.attr('href')?.startsWith('http') ? $item.attr('href') : baseUrl + $item.attr('href'),
                };
            }),
        ...$('.second-section .news-link')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.attr('title'),
                    link: $item.attr('href')?.startsWith('http') ? $item.attr('href') : baseUrl + $item.attr('href'),
                };
            }),
        ...$('.news-section .news-link.absolute')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.attr('title')?.replace('點擊觀看', ''),
                    link: $item.attr('href')?.startsWith('http') ? $item.attr('href') : baseUrl + $item.attr('href'),
                };
            }),
    ];

    const seen = new Set<string>();
    const dedupedList: { title?: string; link?: string }[] = [];
    for (const item of list) {
        const link = item.link || '';
        if (seen.has(link)) {
            continue;
        }
        seen.add(link);
        dedupedList.push(item);
    }

    const items = await Promise.all(
        dedupedList.map((item) =>
            cache.tryGet(item.link as string, async () => {
                const response = await ofetch(item.link as string);
                const $ = load(response);
                if (item.link?.includes('/videos/')) {
                    const ldJson = JSON.parse($('script[type="application/ld+json"]:contains("VideoObject")').text());
                    const videoId = ldJson.embedUrl.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1];

                    item.description =
                        `<iframe id="ytplayer" type="text/html" width="640" height="360" src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><br>` +
                        ldJson.description.replaceAll('\n', '<br>');
                    item.pubDate = timezone(parseDate(ldJson.uploadDate), 8);
                    item.image = ldJson.thumbnailUrl[0];

                    return item;
                }

                const ldJson = JSON.parse($('script[type="application/ld+json"]:contains("NewsArticle")').text());
                const description = $('.rendered-content');
                description.find('.show-in-md, .article-promote-items, [data-ad-part]').remove();

                item.description = description.html();
                item.pubDate = parseDate(ldJson.datePublished);
                item.category = [...new Set([ldJson.articleSection, ...ldJson.keywords])];
                item.author = ldJson.author?.name ?? ldJson.publisher?.name;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link,
        image: `${baseUrl}/favicon.ico`,
        language: 'zh-TW',
        item: items,
    };
}
