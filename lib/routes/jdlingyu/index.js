const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.jdlingyu.mobi/';
const viewProps = {
    tuji: '图集',
    as: '文章',
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'tuji';
    const url = baseUrl + type;
    const response = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(response.data);

    const items = await Promise.all(
        $('#main > div.grid-bor > div')
            .get()
            .map(async (div) => {
                const a = $(div).find('.entry-title > a');
                const link = a.attr('href');
                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    return $('#content-innerText > p').html();
                });
                return Promise.resolve({
                    title: a.text(),
                    description: description,
                    author: $(div).find('.post-header .users').text(),
                    link: link,
                    pubDate: new Date($(div).find('.post-header time').attr('datetime')).toUTCString(),
                });
            })
    );
    ctx.state.data = {
        title: `${viewProps[type]} - 绝对领域`,
        link: url,
        description: `${viewProps[type]} - 绝对领域`,
        item: items,
    };
};
