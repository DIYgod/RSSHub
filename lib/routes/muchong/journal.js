const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const type = ctx.params.type || '';

    const rootUrl = 'http://muchong.com';
    const currentUrl = `${rootUrl}/${type === '' ? 'bbs/journal' : 'journal_cn'}.php`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    const list = $('.jname a, .journal_list a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');
            return {
                title: item.text(),
                link: link.indexOf('http') < 0 ? `${rootUrl}/bbs/${item.attr('href')}` : link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        responseType: 'buffer',
                    });
                    const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));

                    item.description = content('.forum_explan dl table').eq(1).html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
