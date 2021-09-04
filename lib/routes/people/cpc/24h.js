const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const rootUrl = 'http://cpc.people.com.cn';
    const currentUrl = `${rootUrl}/GB/87228/index.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    const list = $('.fl ul li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');

            return {
                title: item.text(),
                link: `${link.indexOf('http') < 0 ? rootUrl : ''}${link}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });
                const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));

                item.description = content('.show_text').html();
                item.pubDate = new Date(content('meta[name="publishdate"]').attr('content')).toUTCString();

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
