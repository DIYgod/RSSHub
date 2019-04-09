const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `http://www.iqiyi.com/${id}.html`,
        headers: {
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
    const list = $('li[data-albumlist-elem="playItem"]');

    ctx.state.data = {
        title: $('title')
            .text()
            .split('-')[0],
        link: `http://www.iqiyi.com/${id}.html`,
        description: description,
        item:
            list &&
            list
                .map((index, item) => {
                    const episode = $(item)
                        .find('p.site-piclist_info_title a')
                        .text()
                        .trim();
                    const describe = $(item)
                        .find('p.site-piclist_info_describe a')
                        .text();
                    const title = `${episode}-${describe}`;

                    return {
                        title,
                        description: `<img referrerpolicy="no-referrer" src="${$(item)
                            .find('.site-piclist_pic .site-piclist_pic_link img')
                            .attr('src')}">`,
                        link: $(item)
                            .find('.site-piclist_pic .site-piclist_pic_link')
                            .attr('href'),
                    };
                })
                .get()
                .reverse(),
    };
};
