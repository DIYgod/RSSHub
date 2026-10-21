import { renderToString } from 'hono/jsx/dom/server';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

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
            target: '/book/:id',
        },
    ],
    name: '漫畫',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { id, coverOnly = 'true', quality = '1' } = ctx.req.param();
    const uuid = await getUuid();
    const {
        data: { data: book },
    } = await getBook(id, uuid);
    const {
        data: { data: chapters },
    } = await getChapters(id, uuid);

    const limit = getRouteLimit(ctx, 3);

    const items = await Promise.all(
        chapters.chapters
            .toSorted((a, b) => b.idx - a.idx)
            .slice(0, limit)
            .map(async (c) => {
                let pages;
                if (coverOnly !== 'true' && coverOnly !== '1') {
                    const chapter = await cache.tryGet(`${apiHost}/book/chapter/${c.id}`, async () => {
                        const {
                            data: { data },
                        } = await getChapter(c.id, uuid);
                        return data.chapter;
                    });

                    if (chapter.free_day === null || chapter.free_day === 0) {
                        pages = await Promise.all(
                            chapter.proportion.map((p) =>
                                cache.tryGet(`${apiHost}/fs/chapter_content/encrypt/${p.id}/${quality}`, async () => {
                                    const { data: imgKey } = await getImgKey(p.id, uuid);
                                    const realKey = getRealKey(imgKey.data.key);
                                    const encrypted = await getImgEncrypted(p.id, quality);
                                    return decrypt(encrypted, realKey);
                                })
                            )
                        );
                    }
                }

                return {
                    title: [c.vol_name, c.name].filter(Boolean).join(' - '),
                    description: renderChapterDescription(pages, c.image1),
                    pubDate: c.online_at ? timezone(parseDate(c.online_at), 8) : undefined,
                    updated: c.updated_at ? timezone(parseDate(c.updated_at), 8) : undefined,
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
        language: 'zh-hant' as Language,
    };
}

const renderChapterDescription = (pages: string[] | undefined, cover?: string): string =>
    renderToString(
        <>
            {pages?.map((page) => (
                <>
                    <br />
                    <img src={page} />
                </>
            ))}
            {cover ? <img src={cover} /> : null}
        </>
    );
