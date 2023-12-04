const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const host = 'https://guangdiu.com';

module.exports = async (ctx) => {
    const query = ctx.params.query ?? '';
    const url = `${host}/${query ? `search.php?${query}` : ''}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('#mainleft > div.zkcontent > div.gooditem')
        .map((_index, item) => ({
            title: $(item).find('a.goodname').text().trim(),
            link: `${host}/${$(item).find('a.goodname').attr('href')}`,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = cheerio.load(detailResponse.data);

                item.description = $('#dabstract').html() + $('a.dgotobutton').html('前往购买');
                item.pubDate = parseRelativeDate($('span.latesttime').text());

                return item;
            })
        )
    );

    const match = /q=(.+)/.exec(query);

    ctx.state.data = {
        title: `逛丢 - ${match[1]}`,
        link: url,
        item: items,
    };
};
