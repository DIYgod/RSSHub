const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseTitle = 'NUIST AS（南信大大气科学学院）';
const baseUrl = 'https://cas.nuist.edu.cn';

module.exports = async (ctx) => {
    const { category = 'xxgg' } = ctx.params;
    const link = `${baseUrl}/index/${category}.htm`;

    const response = await got(link);
    const $ = cheerio.load(response.data);
    const list = $('#ctl00_ctl00_body_NewsList')
        .find('tr.gridline')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.Title').text().trim(),
                link: new URL(item.find('.Title').attr('href'), baseUrl).href,
                pubDate: parseDate(
                    item
                        .find('td')
                        .eq(2)
                        .text()
                        .replace(/[[\]]+/g, ''),
                    'YYYY.MM.DD'
                ),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    const authorMatch = $('.zzxx')
                        .text()
                        .match(/作者:(.*) 发布时间/);
                    item.author = authorMatch ? authorMatch[1].trim() : null;
                    item.pubDate = timezone(
                        parseDate(
                            item
                                .find('.zzxx')
                                .text()
                                .match(/发布时间:(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/)[1]
                        ),
                        +8
                    );
                    item.description = $('#vsb_content').html();
                } catch (e) {
                    // intranet
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: baseTitle + '：' + $('.dqlm').find('a').eq(1).text(),
        description: $('meta[name=description]').attr('content'),
        link,
        item: items,
    };
};
