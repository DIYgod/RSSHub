const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '1';

    const rootUrl = 'http://www.ciidbnu.org';
    const currentUrl = `${rootUrl}/new1.asp?pagetype=${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('#newsrightlist a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href').replace('..', '')}`,
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

                item.description = content('#text').html();
                item.pubDate = timezone(parseDate(content('.t8').eq(0).text(), 'YYYY/M/D H:mm:ss'), +8);

                content('.t14').remove();

                item.author = content('#author').text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('h3').text()} - 中国收入分配研究院`,
        link: currentUrl,
        item: items,
    };
};
