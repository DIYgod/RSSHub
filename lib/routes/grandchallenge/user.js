const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const response = await got({
        method: 'get',
        url: `https://grand-challenge.org/users/${id}`,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.card');

    ctx.state.data = {
        title: `${id} 参加的比赛`,
        link: `https://grand-challenge.org/users/${id}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const itemPicUrl = item.find('img').attr('src');
                    const description = item.find('.card-text').text() || 'No description';
                    return {
                        title: item.find('h5').text(),
                        description: `比赛描述：${description}<br><img src="${itemPicUrl}">`,
                        link: item.find('.stretched-link').attr('href'),
                    };
                })
                .get(),
    };
};
