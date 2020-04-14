const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.zcool.com.cn/top/index.do';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('.author')
        .map((i, e) => {
            const element = $(e);

            const title = element.find('.title').find('a').text();
            const link = element.find('.title').find('a').attr('href');
            const author = element.find('.nick').find('a').text();

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
        title: '站酷 - 作品总榜单',
        link: url,
        item: result.reverse(),
    };
};
