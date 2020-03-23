const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `http://www.jintiankansha.me/column/${id}?type=recent`;
    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('title').text();
    const chapters = $('div.item > table')
        .slice(0, 3)
        .get();
    const items = await Promise.all(
        chapters.map(async (item) => {
            const $ = cheerio.load(item);
            const chapterTitle = $('tr>td>span>a')
                .first()
                .text();
            const chapterUrl = $('tr>td>span>a')
                .first()
                .attr('href');
            const chapterContent = await ctx.cache.tryGet(chapterUrl, async () => {
                const content = await got({
                    method: 'get',
                    url: chapterUrl,
                });
                const $ = cheerio.load(content.data);
                // 处理图片链接
                $('img').each(function() {
                    $(this).attr('src', $(this).attr('data-src'));
                });
                const result = $('.rich_media_content').html();
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
        title: title,
        link: url,
        item: items,
    };
};
