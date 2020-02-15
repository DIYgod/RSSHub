const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://read.aixdzs.com/';

module.exports = async (ctx) => {
    const id1 = ctx.params.id1;
    const id2 = ctx.params.id2;
    const novelUrl = `${baseUrl}${id1}/${id2}/`;
    const response = await got({
        method: 'get',
        url: novelUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('h1').text();
    const description = $('meta[name="description"]').attr('content');
    const lastChapter = $('.chapter')
        .last()
        .children();
    const secondChapter = $('.chapter')
        .last()
        .prev()
        .children();
    const lastChapterUrl = novelUrl + lastChapter.attr('href');
    const secondChapterUrl = novelUrl + secondChapter.attr('href');
    const lastChapterContent = await ctx.cache.tryGet(lastChapterUrl, async () => {
        const lastChapter = await got.get(lastChapterUrl);
        const $ = cheerio.load(lastChapter.data, { decodeEntities: false });
        return $('.content').html();
    });
    // 以下需要判断最新章节是否已填充内容
    let chapterTitle, chapterUrl, chapterContent;
    // 判断新章节内是否存在无内容的提示信息，如存在则请求上一章节数据
    if (lastChapterContent.indexOf('鍦ㄦ洿鏂颁腑锛岃绋嶅悗鍒锋') === -1) {
        chapterTitle = lastChapter.text();
        chapterUrl = lastChapterUrl;
        chapterContent = lastChapterContent;
    } else {
        chapterTitle = secondChapter.text();
        chapterUrl = secondChapterUrl;
        chapterContent = await ctx.cache.tryGet(secondChapterUrl, async () => {
            const secondChapter = await got.get(secondChapterUrl);
            const $ = cheerio.load(secondChapter.data, { decodeEntities: false });
            return $('.content').html();
        });
    }
    ctx.state.data = {
        title: `爱下电子书-${title}`,
        description: description,
        link: novelUrl,
        item: [
            {
                title: chapterTitle,
                link: chapterUrl,
                description: chapterContent,
            },
        ],
    };
};
