const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.daocaorenshuwu.com';

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const count = ctx.params.count || 3;
    const novelUrl = `${baseUrl}/book/${name}`;
    const response = await got({
        method: 'get',
        url: novelUrl,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('h1.book-name')
        .children()
        .text();
    const description = $('div.book-detail').text();
    const chapters = $('.col-md-6')
        .slice(0, count)
        .get();
    const results = await Promise.all(
        chapters.map(async (item) => {
            const $ = cheerio.load(item);

            const chapterTitle = $('a').text();
            const chapterUrl = 'https:' + $('a').attr('href');
            const chapterContent = await ctx.cache.tryGet(chapterUrl, async () => {
                let result = '';
                let temp = chapterUrl;
                while (temp !== '') {
                    // eslint-disable-next-line no-await-in-loop
                    const chapter = await got.get(temp);
                    const $ = cheerio.load(chapter.data);
                    $('div.cont-text > script').remove();
                    result += $('div.cont-text').html();
                    // 如果有下一页则访问下一页
                    if ($('a:contains("下一页")').length > 0) {
                        temp =
                            baseUrl +
                            $('a:contains("下一页")')
                                .last()
                                .attr('href');
                    } else {
                        temp = '';
                    }
                }
                return result;
            });
            return Promise.resolve({
                title: chapterTitle,
                link: chapterUrl,
                description: chapterContent,
            });
        })
    );
    ctx.state.data = {
        title: `稻草人书屋-${title}`,
        description: description,
        link: novelUrl,
        item: results,
    };
};
