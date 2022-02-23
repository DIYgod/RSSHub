const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.aixdzs.com';

module.exports = async (ctx) => {
    if (ctx.params.id2) {
        const redirect = await got.head(`https://read.aixdzs.com/${ctx.params.id1}/${ctx.params.id2}/`, { followRedirect: false });
        const redirectUrl = redirect.headers.location;
        const novel = redirectUrl.substring(1 + redirectUrl.lastIndexOf('/'));

        ctx.status = 301;
        ctx.redirect(`/axdzs/${novel}`);
        return;
    }

    const novel = ctx.params.novel;
    const novelUrl = `${baseUrl}/novel/${novel}/`;
    const response = await got.get(novelUrl);

    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('h1').text();
    const description = $('meta[name="description"]').attr('content');
    const lastChapter = $('.chapter').last().children();
    const secondChapter = $('.chapter').last().prev().children();
    let lastChapterUrl = lastChapter.attr('href');
    let secondChapterUrl = secondChapter.attr('href');
    if (lastChapterUrl.startsWith('/')) {
        lastChapterUrl = baseUrl + lastChapterUrl;
        secondChapterUrl = baseUrl + secondChapterUrl;
    }
    const lastChapterContent = await ctx.cache.tryGet(lastChapterUrl, async () => {
        const res = await got.get(lastChapterUrl);
        const $ = cheerio.load(res.data, { decodeEntities: false });
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
        description,
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
