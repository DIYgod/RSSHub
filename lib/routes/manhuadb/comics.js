const axios = require('@/utils/axios');
const host = 'https://www.manhuadb.com';
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const comicPage = host + `/manhua/${id}`;
    const response = await axios({
        method: 'get',
        url: comicPage,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('li[data-sort] > a');
    const comicTitle = $('.comic-title').text();
    ctx.state.data = {
        title: '漫画DB - ' + comicTitle,
        link: comicPage,
        description: '漫画DB',
        item: list
            .map((i, item) => ({
                title: $(item)
                    .text()
                    .trim(),
                description: $(item)
                    .text()
                    .trim(),
                link: host + $(item).attr('href'),
            }))
            .get(),
    };
};
