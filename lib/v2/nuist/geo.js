const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseTitle = 'NUIST Geography（南信大地科院）';
const baseUrl = 'https://geography.nuist.edu.cn/';

module.exports = async (ctx) => {
    const { category = '1954' } = ctx.params;
    const link = `${baseUrl}/${category}/list.htm`;

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('.col_news_list .news')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.news_title').text().trim(),
                link: new URL(item.find('.news_title a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.news_meta').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    item.author = $('.arti_publisher') ? $('.arti_publisher').text() : null;
                    item.pubDate = parseDate(
                        $('.arti_update').text().match(/\d.*?-\d\d-\d\d/)[0]
                    );

                    var description = $('.entry').html()
                    description = description.replace(/class=".*?"/g, "");
                    item.description = description;
                } catch (e) {
                    // intranet
                }

                return item;
            })
        )
    );
    ctx.state.data = {
        title: baseTitle,
        link,
        description: $('title').text(),
        item: items,
    };
};
