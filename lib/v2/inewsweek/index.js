const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
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
                    const time = timezone(
                        parseDate(
                            $('div.editor')
                                .html()
                                .split(/(\s\s+)/)[2]
                        ),
                        +8
                    );
                    return {
                        title: item.find('p').text(),
                        description: fullText,
                        link: articleLink,
                        pubDate: time,
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
