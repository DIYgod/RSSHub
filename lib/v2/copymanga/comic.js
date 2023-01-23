const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const host = 'copymanga.site';
const baseUrl = `https://${host}`;
const apiBaseUrl = `https://api.${host}`;

// 直接调用拷贝漫画的接口
module.exports = async (ctx) => {
    const { id } = ctx.params;
    // 用于控制返回的章节数量
    const chapterCnt = Number(ctx.params.chapterCnt || 0);
    // 获取漫画列表
    let bHasNextPage = false;
    const iReqLimit = (ctx.queries && ctx.queries.limit) || 100;
    let iReqOffSet = 0;
    const strBaseUrl = `${apiBaseUrl}/api/v3/comic/${id}/group/default/chapters`;
    let chapterArray = [];

    do {
        bHasNextPage = false;
        // eslint-disable-next-line no-await-in-loop
        const { data } = await got(strBaseUrl, {
            headers: {
                platform: 1,
            },
            searchParams: {
                limit: iReqLimit,
                offset: iReqOffSet === 0 ? undefined : iReqOffSet,
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

        chapterArray = [...chapterArray, ...results.list];
    } while (bHasNextPage);

    chapterArray = chapterArray
        .map(({ comic_path_word, uuid, name, size, datetime_created /* , index*/ }) => ({
            link: `${baseUrl}/comic/${comic_path_word}/chapter/${uuid}`,
            uuid,
            title: name,
            size,
            pubDate: datetime_created,
            // index,
        }))
        .reverse();

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
            data: { results },
        } = await got(`${apiBaseUrl}/api/v3/comic/${id}/chapter2/${chapter.uuid}`, {
            headers: {
                webp: 1,
            },
        });

        const pageNumbers = Object.values(results.chapter.words);
        const contents = results.chapter.contents
            .map((content, index) => ({
                page: pageNumbers[index],
                url: content.url,
            }))
            .sort((a, b) => a.page - b.page);

        return {
            link: chapter.link,
            title: chapter.title,
            description: art(path.join(__dirname, './templates/comic.art'), {
                size: chapter.size,
                contents,
            }),
            pubDate: parseDate(chapter.pubDate, 'YYYY-MM-DD'),
        };
    };

    let itemsLen = chapterArray.length;

    if (chapterCnt > 0) {
        itemsLen = chapterCnt;
    }

    ctx.state.data = {
        title: `拷贝漫画 - ${bookTitle}`,
        link: `${baseUrl}/comic/${id}`,
        description: bookIntro,
        item: await Promise.all(chapterArray.slice(0, itemsLen).map((chapter) => ctx.cache.tryGet(chapter.link, () => genResult(chapter)))),
    };
};
