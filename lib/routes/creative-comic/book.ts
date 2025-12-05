import path from 'node:path';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { apiHost, decrypt, getBook, getChapter, getChapters, getImgEncrypted, getImgKey, getRealKey, getUuid } from './utils';

export const route: Route = {
    path: '/book/:id/:coverOnly?/:quality?',
    categories: ['anime'],
    example: '/creative-comic/book/117',
    parameters: { id: '漫畫 ID，可在 URL 中找到', coverOnly: '僅獲取封面，非 `true` 時將獲取**全部**頁面，預設 `true`', quality: '閱讀品質，標準畫質 `1`，高畫質 `2`，預設 `1`' },
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
            source: ['creative-comic.tw/book/:id/*'],
            target: '/:id',
        },
    ],
    name: '漫畫',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { id, coverOnly = 'true', quality = '1' } = ctx.req.param();
    const uuid = await getUuid(cache.tryGet);
    const {
        data: { data: book },
    } = await getBook(id, uuid);
    const {
        data: { data: chapters },
    } = await getChapters(id, uuid);

    const items = await Promise.all(
        chapters.chapters
            .toSorted((a, b) => b.idx - a.idx)
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 3)
            .map(async (c) => {
                let pages;
                if (coverOnly !== 'true' && coverOnly !== '1') {
                    const {
                        data: { data: chapter },
                    } = await getChapter(c.id, uuid);

                    if (chapter.chapter.free_day === null || chapter.chapter.free_day === 0) {
                        pages = await Promise.all(
                            chapter.chapter.proportion.map(async (p) => {
                                let { data: imgKey } = await getImgKey(p.id, uuid);
                                imgKey = imgKey.data.key;

                                const realKey = getRealKey(imgKey);
                                const encrypted = await getImgEncrypted(p.id, quality);

                                return cache.tryGet(`${apiHost}/fs/chapter_content/encrypt/${p.id}/${quality}`, () => decrypt(encrypted, realKey));
                            })
                        );
                    }
                }

                return {
                    title: c.vol_name,
                    description: art(path.join(__dirname, 'templates/chapter.art'), {
                        chapter: c,
                        pages,
                        cover: c.image1,
                    }),
                    pubDate: parseDate(c.online_at),
                    updated: parseDate(c.updated_at),
                    link: `https://www.creative-comic.tw/reader_comic/${c.id}`,
                    author: book.author.map((author) => author.name).join(', '),
                    category: book.tags.map((tag) => tag.name),
                };
            })
    );

    return {
        title: `${book.name} | CCC創作集`,
        description: `${book.brief} ${book.description}`,
        link: book.share_link,
        image: book.image1,
        item: items,
        language: 'zh-hant',
    };
}
