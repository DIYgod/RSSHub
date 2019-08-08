const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await got({
        method: 'get',
        url: `http://www.iqiyi.com/u/${uid}/v`,
        headers: {
            Host: 'www.iqiyi.com',
            Referer: `http://www.iqiyi.com/u/${uid}/v`,
        },
        responseType: 'document',
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const description = '';

    const list = $('li[j-delegate="colitem"]');

    ctx.state.data = {
        title: $('title').text(),
        link: `http://www.iqiyi.com/u/${uid}/videos`,
        description: description,
        item:
            list &&
            list
                .map((index, item) => {
                    const title = $(item)
                        .find('.site-piclist_pic a')
                        .attr('data-title');

                    return {
                        title,
                        description: `<img referrerpolicy="no-referrer" src="${$(item)
                            .find('.site-piclist_pic img')
                            .attr('src')}">`,
                        link: $(item)
                            .find('.site-piclist_pic a')
                            .attr('href'),
                    };
                })
                .get()
                .reverse(),
    };
};
