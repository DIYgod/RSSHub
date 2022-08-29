const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    let link, title;
    if (type === 'mm') {
        link = 'https://www.qidian.com/mm/free';
        title = '起点女生网';
    } else {
        link = 'https://www.qidian.com/free';
        title = '起点中文网';
    }

    const response = await got(link);
    const $ = cheerio.load(response.data);

    const list = $('div.other-rec-wrap li');
    const out = list
        .map((index, item) => {
            item = $(item);

            const img = `<img src="https:${item.find('.img-box img').attr('src')}">`;
            const rank = `<p>评分：${item.find('.img-box span').text()}</p>`;

            return {
                title: item.find('.book-info h4 a').text(),
                description: img + rank + item.find('p.intro').html(),
                link: 'https:' + item.find('.book-info h4 a').attr('href'),
                author: item.find('p.author a').text(),
            };
        })
        .get();

    ctx.state.data = {
        title,
        description: `限时免费下期预告-${title}`,
        link,
        item: out,
    };
};
