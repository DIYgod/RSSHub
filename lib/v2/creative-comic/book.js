const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { getUuid, getBook, getChapter, getChapters, getImgEncrypted, getImgKey, decrypt, getRealKey, siteHost } = require('./utils');

module.exports = async (ctx) => {
    const { id, coverOnly = 'true', quality = '1' } = ctx.params;
    const uuid = await getUuid(ctx.cache.tryGet);
    let { data: book } = await getBook(id, uuid);
    let { data: chapters } = await getChapters(id, uuid);
    book = book.data;
    chapters = chapters.data;

    const items = await Promise.all(
        chapters.chapters.map(async (c) => {
            let pages;
            if (coverOnly !== 'true' && coverOnly !== '1') {
                let { data: chapter } = await getChapter(c.id, uuid);
                chapter = chapter.data;

                if (chapter.chapter.free_day === null || chapter.chapter.free_day === 0) {
                    pages = await Promise.all(
                        chapter.chapter.proportion.map(async (p) => {
                            let { data: imgKey } = await getImgKey(p.id, uuid);
                            imgKey = imgKey.data.key;

                            const realKey = getRealKey(imgKey);
                            const encrypted = await getImgEncrypted(p.id, quality);

                            return ctx.cache.tryGet(`${siteHost}/fs/chapter_content/encrypt/${p.id}/${quality}`, () => decrypt(encrypted, realKey));
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

    ctx.state.data = {
        title: `${book.name} | CCC創作集`,
        description: `${book.brief} ${book.description}`,
        link: book.share_link,
        image: book.image1,
        item: items,
        language: 'zh-hant',
    };
};
