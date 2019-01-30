const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');
const date = require('../../utils/date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://www.huxiu.com/member/${id}.html`;
    const host = 'https://www.huxiu.com';
    const response = await axios({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const $ = cheerio.load(response.data);
    const author = $('.user-name')
        .text()
        .trim();

    const list = $('.message-box > .mod-art > a')
        .slice(0, 10)
        .get()
        .map((e) => $(e).attr('href'));

    const items = await Promise.all(
        list.map(async (e) => {
            const itemUrl = url.resolve(host, e);

            const single = await ctx.cache.tryGet(
                itemUrl,
                async () => {
                    const response = await axios.get(itemUrl);
                    const $ = cheerio.load(response.data);
                    $('.neirong-shouquan, .neirong-shouquan-public').remove();
                    return {
                        title: $('.t-h1')
                            .text()
                            .trim(),
                        link: itemUrl,
                        description: $('.article-img-box').html() + $('.article-content-wrap').html(),
                        pubDate: date($('.article-time').text(), 8),
                        author,
                    };
                },
                2 * 24 * 60 * 60
            );

            return Promise.resolve(single);
        })
    );
    const authorInfo = `虎嗅网 - ${author}`;
    ctx.state.data = {
        title: authorInfo,
        link,
        description: authorInfo,
        item: items,
    };
};
