const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const rootUrl = 'https://blog.sciencenet.cn';
    const currentUrl = `${rootUrl}/u/${id}`;

    let response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    let $ = cheerio.load(iconv.decode(response.data, 'gbk'));

    response = await got({
        method: 'get',
        url: $('.xg1 a').eq(1).attr('href'),
    });

    $ = cheerio.load(response.data);

    let items = $('item')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('title').text(),
                link: item.find('guid').text(),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    responseType: 'buffer',
                });

                const content = cheerio.load(iconv.decode(detailResponse.data, 'gbk'));

                item.author = content('.xs2').text();
                item.description = content('#blog_article').html();
                item.pubDate = timezone(parseDate(content('.xg1').eq(5).text()), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `科学网 - ${items[0].author}的博文`,
        link: currentUrl,
        item: items,
    };
};
