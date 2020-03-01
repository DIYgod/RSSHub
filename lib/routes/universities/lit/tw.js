const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://www.lit.edu.cn/tw/';
const nameProps = {
    tntz: '团内通知',
    qnkx: '青年快讯',
};

module.exports = async (ctx) => {
    const name = ctx.params.name || 'all';
    const urla = name === 'all' ? baseUrl : url.resolve(baseUrl, `${name}.htm`);
    const response = await got.get(urla);
    const $ = cheerio.load(response.data);
    const list =
        name === 'all'
            ? $('.con_wap')
                  .find('li')
                  .get()
            : $('ul.caselist li').get();

    const out = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const link = url.resolve(baseUrl, item.find('a').attr('href'));
            const pubDate = name === 'all' ? item.find('span').text() : item.children('.time').text();

            const other = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);
                const $ = cheerio.load(result.data);

                $('img[src="/system/resource/images/fileTypeImages/icon_xls.gif"]').remove();
                $('img[src="/system/resource/images/fileTypeImages/icon_doc.gif"]').remove();
                $('img[src="/system/resource/images/fileTypeImages/icon_ppt.gif"]').remove();
                $('img[src="/system/resource/images/fileTypeImages/icon_pdf.gif"]').remove();

                const description = $('#textarea').html();
                const title = $('article > section > form > h2').text();
                return {
                    description,
                    title,
                };
            });

            const single = {
                link: link,
                pubDate,
            };

            return Promise.resolve(Object.assign({}, single, other));
        })
    );

    ctx.state.data = {
        title: name === 'all' ? `团委 - 洛阳理工学院` : `${nameProps[name]} - 洛理团委`,
        link: urla,
        description: `洛阳理工学院团委 RSS`,
        item: out,
    };
};
