const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const uname = ctx.params.uname;

    const url = 'https://' + uname + '.zcool.com.cn';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);
    const author = $('.people-nick-name')
        .text()
        .trim();

    const list = $('.work-list-box > .card-box')
        .map((i, e) => {
            const element = $(e);
            const title = element
                .find('.card-info-title')
                .find('a')
                .attr('title')
                .trim();
            const link = element
                .find('.card-info-title')
                .find('a')
                .attr('href')
                .trim();
            return {
                title: title,
                description: '',
                link: link,
                author: author,
            };
        })
        .get();

    const result = await Promise.all(
        list.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link);
            const itemElement = cheerio.load(itemReponse.data);
            item.description = itemElement('.work-content-wrap').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '站酷 - ' + author,
        link: url,
        item: result.reverse(),
    };
};
