import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/article/:id',
    name: '章节',
    url: 'm.51read.org',
    maintainers: ['lazwa34'],
    example: '/51read/article/152685',
    parameters: { id: '小说 id, 可在对应小说页 URL 中找到' },
    categories: ['reading'],
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
            source: ['m.51read.org/xiaoshuo/:id'],
            target: '/article/:id',
        },
        {
            source: ['51read.org/xiaoshuo/:id'],
            target: '/article/:id',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { id } = ctx.req.param();
    const link = `https://m.51read.org/xiaoshuo/${id}`;
    const bookHtml = await ofetch(link);
    const $book = load(bookHtml);
    const item = await Promise.all(
        $book('.wr-chapter-grid a')
            .toArray()
            .map((chapter) => buildItem(new URL(chapter.attribs.href, link).href, link))
    );
    const cover = $book('.wr-book-hero img').attr('src');
    const latestChapter = $book('meta[property="og:novel:latest_chapter_url"]').attr('content');
    const updateTime = $book('meta[property="og:novel:update_time"]').attr('content');
    if (updateTime) {
        const latestItem = item.find((chapter) => chapter.link === latestChapter);
        if (latestItem) {
            latestItem.pubDate = timezone(parseDate(updateTime, 'YYYY-MM-DD HH:mm'), 8);
        }
    }

    return {
        title: $book('h1').text(),
        description: $book('.wr-intro p').text(),
        link,
        item,
        image: cover ? new URL(cover, link).href : undefined,
        author: $book('meta[property="og:novel:author"]').attr('content'),
        language: 'zh-CN' as const satisfies Language,
    };
}

const buildItem = (url: string, bookUrl: string) =>
    cache.tryGet(url, async (): Promise<DataItem> => {
        const html = await ofetch(url, {
            headers: {
                referer: bookUrl,
            },
        });
        const $ = load(html);
        $('.wr-source-content div, .wr-source-content script, .js_chapter_more_text, .wr-source-content p[style*="text-align:center"]').remove();

        return {
            title: $('h1').text(),
            description: $('.wr-source-content').html(),
            link: url,
        };
    });
