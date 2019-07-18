const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.yinwang.org';
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const resultItem = $("li[class='list-group-item title']")
        .map((index, elem) => {
            elem = $(elem);

            return {
                title: elem.find('a').text(),
                description: elem.find('a').text(),
                link: url + elem.find('a').attr('href'),
                author: '王垠',
            };
        })
        .get();

    ctx.state.data = {
        title: '王垠的博客-当然我在扯淡',
        link: url,
        item: resultItem,
    };
};
