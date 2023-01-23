const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const iconv = require('iconv-lite');

const rootUrl = 'http://news.inewsweek.cn';

module.exports = async (ctx) => {
    const channel = ctx.params.channel;
    const url = `${rootUrl}/${channel}`;
    const response = await got(url, {
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const items = await Promise.all(
        $('div.grid-item')
            .toArray()
            .map((item) => {
                item = $(item);
                const href = item.find('a').attr('href');
                const articleLink = `${rootUrl}${href}`;
                return ctx.cache.tryGet(articleLink, async () => {
                    const response = await got(articleLink, {
                        responseType: 'buffer',
                    });

                    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
                    const fullText = $('div.contenttxt').html();

                    return {
                        title: item.find('p').text(),
                        description: fullText,
                        link: articleLink,
                        pubDate: parseDate(href.match('/.*/(.*)/.*')[1]),
                    };
                });
            })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: items,
    };
};
