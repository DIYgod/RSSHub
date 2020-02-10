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
    const chapterUrl = novelUrl + lastChapter.attr('href');
    const chapterTitle = lastChapter.text();
    const chapterContent = await ctx.cache.tryGet(chapterUrl, async () => {
        const lastChapter = await got.get(chapterUrl);
        const $ = cheerio.load(lastChapter.data);
        return $('.content').html();
    });
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
