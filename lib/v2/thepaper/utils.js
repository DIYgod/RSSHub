const cheerio = require('cheerio');
const date = require('@/utils/date');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const got = require('@/utils/got');

module.exports = {
    ProcessFeed: async (query, link, ctx) => {
        const res = await got(link);

        const $ = cheerio.load(res.data);
        const list = $(query).slice(0, 10).get();

        return Promise.all(
            list.map((item) => {
                const $ = cheerio.load(item);
                const itemUrl = `https://m.thepaper.cn/${$(item).find('a').eq(0).attr('href')}`;
                return ctx.cache.tryGet(itemUrl, async () => {
                    const res = await got(itemUrl);
                    const content = cheerio.load(res.data);

                    let description, pubDate;

                    if (content('div.news_video_msg').length > 0) {
                        description = content('#vdetail_sum').html();
                        pubDate = timezone(
                            parseDate(
                                content('div.news_video_msg')
                                    .html()
                                    .replace(/&nbsp;/gi, '')
                                    .split('<br>')[0]
                            ),
                            +8
                        );
                    } else if (content('#slider_wrapper_ul').length > 0) {
                        description = '';
                        pubDate = new Date(date($(item).find('div.list_item_extra span').eq(1).text())).toUTCString();
                    } else {
                        description = content('div.newsdetail_content').html();
                        pubDate = timezone(parseDate(content('div.date').text().trim().split('来源：')[0].trim()), +8);
                    }

                    const single = {
                        title: content('title').text(),
                        link: itemUrl,
                        description,
                        pubDate,
                        author: content('div.author').text(),
                    };
                    return single;
                });
            })
        );
    },
};
