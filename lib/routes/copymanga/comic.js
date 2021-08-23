const cheerio = require('cheerio');
const got = require('@/utils/got');

const genChapters = (srcArray) => {
    const dstArray = [];
    let dstArrayItem = {};
    srcArray.forEach((element) => {
        dstArrayItem = {};
        dstArrayItem.link = 'https://copymanga.com/comic/' + element.comic_path_word + '/chapter/' + element.uuid;
        dstArrayItem.title = element.name;
        dstArrayItem.num = element.size;
        dstArrayItem.updateTime = element.datetime_created;
        dstArrayItem.index = element.index;
        dstArray.push(dstArrayItem);
    });
    return dstArray;
};

// 直接调用拷贝漫画的接口
module.exports = async (ctx) => {
    const { id } = ctx.params;

    // 获取漫画列表
    let bHasNextPage = false;
    const iReqLimit = ctx.queries && ctx.queries.limit || 100;    const iReqLimit = ctx.queries && ctx.queries.limit || 100;
    let iReqOffSet = 0;
    const strBaseUrl = `https://api.copymanga.com/api/v3/comic/${id}/group/default/chapters?`;
    let chapterArray = [];

    do {
        bHasNextPage = false;
        // eslint-disable-next-line no-await-in-loop
        const data = await got.get(strBaseUrl + 'limit=' + iReqLimit + '&offset=' + iReqOffSet);
        const chaptersObj = JSON.parse(data.body);

        if (chaptersObj.code !== 200) {
            break;
        }

        if (chaptersObj.results.limit + chaptersObj.results.offset < chaptersObj.results.total) {
            bHasNextPage = true;
        }
        iReqOffSet += iReqLimit;

        chapterArray = chapterArray.concat(chaptersObj.results.list);
    } while (bHasNextPage);

    chapterArray = chapterArray.map(({ comic_path_word, uuid, name, size, datetime_created, index }) => ({
        link: 'https://copymanga.com/comic/' + comic_path_word + '/chapter/' + uuid,
        title: name,
        num: size,
        updateTime: datetime_created,
        index,
    })).reverse();

    // 获取漫画标题、介绍
    const { bookTitle, bookIntro } = ctx.cache.tryGet(`https://copymanga.com/comic/${id}`, async () => {
        const { data } = await got.get(`https://copymanga.com/comic/${id}`);
        const $ = cheerio.load(data);
        return {
            bookTitle: $('.comicParticulars-title-right > ul > li > h6').text(),
            bookIntro: $('.intro').text(),
        };
    });
    // const coverImgSrc = $('.comicParticulars-left-img > img').attr('data-src');

    const genResult = (chapter) => ({
        link: chapter.link,
        title: chapter.title,
        description: `
            <h1>${chapter.num}p</h1>
        `.trim(),
    });

    ctx.state.data = {
        title: `拷贝漫画 - ${bookTitle}`,
        link: `https://copymanga.com/comic/${id}`,
        description: bookIntro,
        item: chapterArray.map(genResult),
    };
};
