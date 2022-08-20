const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const baseUrl = 'https://grad.nua.edu.cn';

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const newsUrl = `${baseUrl}/${type}/list.htm`;

    const response = await got(newsUrl, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const pagename = $('.col_title').text();

    const items = $('li.list_item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                link: baseUrl + item.find('a').attr('href'),
                title: item.find('a').attr('title'),
                pubDate: timezone(parseDate(item.find('.Article_PublishDate').first().text(), 'YYYY-MM-DD'), +8),
            };
        });

    const results = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const result = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = cheerio.load(result.data);

                item.author = $('.arti_publisher').text();
                item.description = $('.read').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'NUA-研究生处-' + pagename,
        link: `${baseUrl}/${type}/list.htm`,
        description: '南京艺术学院研究生处' + pagename,
        item: results,
    };
};
