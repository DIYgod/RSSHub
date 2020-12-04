const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const sort = ctx.params.sort || 'time';

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://movie.douban.com/celebrity/${id}/movies?sortby=${sort}`,
    });

    const data = response.data; // response.data 为 HTTP GET 请求返回的 HTML

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('div.grid_view > ul li'); // 使用 cheerio 选择器

    const person = $('#content > h1')
        .text()
        .replace(/的全部作品（\d{1,}）/, '');
    let itemPicUrl;

    ctx.state.data = {
        title: `豆瓣电影人 - ${person}`,
        link: `https://movie.douban.com/celebrity/${id}/movies?sortby=${sort}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('img').attr('src');
                    return {
                        title: '《' + item.find('h6 > a').text() + '》' + item.find('h6 > span').text().replace('(', '（').replace(')', '）').replace('[', '【').replace(']', '】'),
                        description: `<img src="${itemPicUrl}"/><br/>主演：${item.find('dl > dd').last().text()}<br/>评分：${item.find('.star > span:nth-child(2)').text()}`,
                        link: item.find('dt > a').attr('href'),
                    };
                })
                .get(),
    };
};
