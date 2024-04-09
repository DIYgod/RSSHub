const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const host = 'https://guangdiu.com';

module.exports = async (ctx) => {
    const query = ctx.params.query ?? '';
    let url;
    if (query === 'c=us') {
        url = `${host}/?c=us`;
    } else {
        url = `${host}/${query ? `cate.php?${query}` : ''}`;
    }

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('#mainleft > div.zkcontent > div.gooditem')
        .map((_index, item) => ({
            title: $(item).find('a.goodname').text().trim(),
            link: new URL($(item).find('div.iteminfoarea > h2 > a').attr('href'), host).href,
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

    ctx.state.data = {
        title: `逛丢 - ${query.indexOf('c=us') > -1 ? '海外' : '国内'}`,
        link: url,
        item: items,
    };
};
