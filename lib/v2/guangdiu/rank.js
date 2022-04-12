const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const host = 'https://guangdiu.com';

module.exports = async (ctx) => {
    const url = `${host}/rank.php`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('div.hourrankitem')
        .map((_index, item) => ({
            title: $(item).find('a.hourranktitle').text(),
            link: new URL($(item).find('a.hourranktitle').attr('href'), host).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = cheerio.load(detailResponse.data);

                item.description = $('#dabstract').html() + $('a.dgotobutton').html('前往购买');
                item.pubDate = parseRelativeDate($('div.hourranktime').text());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `逛丢 - 一小时风云榜`,
        link: url,
        item: items,
    };
};
