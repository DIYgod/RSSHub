const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const topic = ctx.params.topic;

    const response = await got({
        method: 'get',
        url: `https://www.chinadialogue.net/topics/${topic}`,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('article.excerpt.col-md-6');
    let itemPicUrl;
    let title;
    let description;

    ctx.state.data = {
        title: $('title')
            .text()
            .replace(/( 主题 >| Topics >)/gm, ''),
        link: `https://www.chinadialogue.net/topics/${topic}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('img.img-responsive').attr('src');

                    title = [];
                    description = [];

                    item.find('h1').each(function(index, element) {
                        title.push(
                            $(element)
                                .text()
                                .replace(/(\r\n|\n|\r)/gm, '')
                        );
                    });

                    item.find('p').each(function(index, element) {
                        description.push($(element).text());
                    });

                    return {
                        title: title.join(' | '),
                        description: `<p>${description.join('</p><p>')}</p><img src="${itemPicUrl}">`,
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};
