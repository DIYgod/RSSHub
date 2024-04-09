const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;
const asyncPool = require('tiny-async-pool');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    // 用于控制返回的章节数量
    const chapterCnt = Number(ctx.params.chapterCnt || 10);
    // 直接调用拷贝漫画的接口
    const host = 'copymanga.site';
    const baseUrl = `https://${host}`;
    const apiBaseUrl = `https://api.${host}`;
    const strBaseUrl = `${apiBaseUrl}/api/v3/comic/${id}/group/default/chapters`;
    const iReqLimit = 500;
    // 获取漫画列表
    const chapterArray = await ctx.cache.tryGet(
        strBaseUrl,
        async () => {
            let bHasNextPage = false;
            let chapters = [];
            let iReqOffSet = 0;

            do {
                bHasNextPage = false;
                // eslint-disable-next-line no-await-in-loop
                const { data } = await got(strBaseUrl, {
                    headers: {
                        platform: 1,
                    },
                    searchParams: {
                        limit: iReqLimit,
                        offset: iReqOffSet,
                    },
                });
                const { code, results } = data;

                if (code !== 200) {
                    break;
                }

                if (results.limit + results.offset < results.total) {
                    bHasNextPage = true;
                }
                iReqOffSet += iReqLimit;

                chapters = [...chapters, ...results.list];
            } while (bHasNextPage);

            chapters = chapters
                .map(({ comic_path_word, uuid, name, size, datetime_created, ordered /* , index*/ }) => ({
                    link: `${baseUrl}/comic/${comic_path_word}/chapter/${uuid}`,
                    uuid,
                    title: name,
                    size,
                    pubDate: parseDate(datetime_created, 'YYYY-MM-DD'),
                    ordered,
                    // index,
                }))
                .sort((a, b) => b.ordered - a.ordered);

            return chapters;
        },
        config.cache.routeExpire,
        false
    );

    // 获取漫画标题、介绍
    const { bookTitle, bookIntro } = await ctx.cache.tryGet(`${baseUrl}/comic/${id}`, async () => {
        const { data } = await got(`${baseUrl}/comic/${id}`);
        const $ = cheerio.load(data);
        return {
            bookTitle: $('.comicParticulars-title-right > ul > li > h6').text(),
            bookIntro: $('.intro').text(),
        };
    });

    const genResult = async (chapter) => {
        const {
            data: { code, results },
        } = await got(`${apiBaseUrl}/api/v3/comic/${id}/chapter/${chapter.uuid}`, {
            headers: {
                webp: 1,
            },
        });

        let contents;
        if (code === 210) {
            // Request was throttled. Expected available in x seconds.
            contents = [];
        } else {
            contents = results.chapter.contents.map((content) => ({ url: content.url.replace('.c800x.', '.c1500x.') }));
        }

        return {
            link: chapter.link,
            title: chapter.title,
            description: art(path.join(__dirname, './templates/comic.art'), {
                size: chapter.size,
                contents,
            }),
            pubDate: chapter.pubDate,
        };
    };

    const asyncPoolAll = async (...args) => {
        const results = [];
        for await (const result of asyncPool(...args)) {
            results.push(result);
        }
        return results;
    };

    const result = await asyncPoolAll(3, chapterArray.slice(0, chapterCnt), (chapter) => ctx.cache.tryGet(chapter.link, () => genResult(chapter)));
    const items = [...result, ...chapterArray.slice(chapterCnt)];

    ctx.state.data = {
        title: `拷贝漫画 - ${bookTitle}`,
        link: `${baseUrl}/comic/${id}`,
        description: bookIntro,
        item: items,
    };
};
