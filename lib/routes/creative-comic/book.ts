// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
const { getUuid, getBook, getChapter, getChapters, getImgEncrypted, getImgKey, decrypt, getRealKey, siteHost } = require('./utils');

export default async (ctx) => {
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
            .sort((a, b) => b.idx - a.idx)
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

                                return cache.tryGet(`${siteHost}/fs/chapter_content/encrypt/${p.id}/${quality}`, () => decrypt(encrypted, realKey));
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

    ctx.set('data', {
        title: `${book.name} | CCC創作集`,
        description: `${book.brief} ${book.description}`,
        link: book.share_link,
        image: book.image1,
        item: items,
        language: 'zh-hant',
    });
};
