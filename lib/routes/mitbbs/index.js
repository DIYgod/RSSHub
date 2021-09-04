const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const caty = ctx.params.caty || '';
    const rootUrl = 'http://www.mitbbs.com';
    const currentUrl = `${rootUrl}/${caty === '' ? 'news/mitbbs_news_zahui.php' : 'news_pg/' + ctx.params.caty + '.html'}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gb2312'));
    const list = $('tr[align="center"] td a.blue_14p_link, tr[bgcolor="#FFFFFF"] td a.blue_14p_link')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: new Date(item.find('div.weinei_left_con_line_date').text() + ' GMT+8').toUTCString(),
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
                    const content = cheerio.load(iconv.decode(detailResponse.data, 'gb2312'));

                    const dateTd = content('.black_32p').parent();
                    dateTd.find('span, p').remove();

                    item.pubDate = new Date(dateTd.text().trim().replace(/年|月/g, '-').replace('日', ' ')).toUTCString();
                    item.description = content('table').eq(5).find('table').eq(1).html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `未名新闻 - ${caty === '' ? '新闻大杂烩' : $('strong').eq(1).text()}`,
        link: currentUrl,
        item: items,
    };
};
