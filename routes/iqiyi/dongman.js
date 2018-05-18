const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `http://www.iqiyi.com/${id}.html`,
        headers: {
            'User-Agent': config.ua,
            Host: 'www.iqiyi.com',
            Referer: `http://www.iqiyi.com/${id}.html`,
        },
        responseType: 'document',
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const description = $('span[data-moreorless="moreinfo"][itemprop="description"] span')
        .text()
        .split('\n')[0];
    const list = $('div[data-block-name="图文选集区"]').find('ul.site-piclist li');

    ctx.state.data = {
        title: $('title')
            .text()
            .split('-')[0],
        link: `http://www.iqiyi.com/${id}.html`,
        description: description,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: `${$(item)
                        .find('p.site-piclist_info_title a')
                        .text()}`,
                    description: `<img referrerpolicy="no-referrer" src="${$(item)
                        .find('img')
                        .attr('src')}">`,
                    link: $(item)
                        .find('a')
                        .attr('href'),
                }))
                .get()
                .reverse(),
    };
};
