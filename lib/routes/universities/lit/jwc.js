const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://www.lit.edu.cn/jwc/';
module.exports = async (ctx) => {
    const response = await got.get(baseUrl);

    const $ = cheerio.load(response.data);
    const list = $('article.post_box').get();

    const out = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const link = url.resolve(baseUrl, item.find('a').attr('href'));
            const single = {
                title: item.find('a').attr('title'),
                link: link,
            };

            const other = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);
                const $ = cheerio.load(result.data);

                $('img[src="/system/resource/images/fileTypeImages/icon_xls.gif"]').remove();
                $('img[src="/system/resource/images/fileTypeImages/icon_doc.gif"]').remove();
                $('img[src="/system/resource/images/fileTypeImages/icon_ppt.gif"]').remove();
                $('img[src="/system/resource/images/fileTypeImages/icon_pdf.gif"]').remove();

                const description = $('article.entry-content').html();
                const pubDate = $('time').text();
                const author = $('aside > span:nth-child(1)').text();
                return {
                    description,
                    pubDate,
                    author,
                };
            });

            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title: `教务处 - 洛阳理工学院`,
        link: baseUrl,
        description: `洛阳理工教务在线 RSS`,
        item: out,
    };
};
