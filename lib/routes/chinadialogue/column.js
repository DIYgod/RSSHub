const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const column = ctx.params.column;

    const response = await got({
        method: 'get',
        url: `https://www.chinadialogue.net/${column}`,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('article.main-listing');
    let itemPicUrl;
    let title;
    let description;

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.chinadialogue.net/${column}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('img.img-responsive').attr('src');

                    title = [];
                    description = [];

                    item.find('h1').each((index, element) => {
                        title.push(
                            $(element)
                                .text()
                                .replace(/(\r\n|\n|\r)/gm, '')
                        );
                    });

                    item.find('p').each((index, element) => {
                        description.push(
                            $(element)
                                .text()
                                .replace(/(\r\n|\n|\r)/gm, '')
                        );
                    });

                    return {
                        title: title.join(' | '),
                        description: `<p>${description.join('</p><p>')}</p><img src="${itemPicUrl}">`,
                        pubDate: item.find('time.blog').attr('datetime'),
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
