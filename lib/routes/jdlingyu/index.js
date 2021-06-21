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
        $('#post-list > ul.b2_gap > li')
            .get()
            .map(async (div) => {
                const a = $(div).find('.post-info > h2 > a');
                const link = a.attr('href');
                const description = await ctx.cache.tryGet(link, async () => {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    return $('.entry-content > p').html();
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
