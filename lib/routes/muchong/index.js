const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const id = ctx.params.id || '';
    const sort = ctx.params.sort || '';
    const type = ctx.params.type || 'all';

    const rootUrl = 'http://muchong.com';
    const currentUrl = `${rootUrl}/f-${id}-1${sort === '' ? '' : '-' + sort}${type === 'all' ? '' : '-typeid-' + type}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    const list = $('.xmc_bpt tbody .forum_list')
        .slice(1, 10)
        .map((_, item) => {
            item = $(item);
            return {
                author: item.find('.by cite a').text(),
                link: `${rootUrl}${item.find('.a_subject').attr('href')}`,
                title: item.find('.thread-name span').eq(0).text() + item.find('.a_subject').text(),
                pubDate: new Date(sort === '' ? item.find('.by cite nobr').text() : item.find('.by .xmc_b9').eq(0).text()).toUTCString(),
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

                    item.description = content('#pid1').find('.t_fsz').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: $('title').text().replace('-学术科研互动平台', ''),
        link: currentUrl,
        item: items,
    };
};
