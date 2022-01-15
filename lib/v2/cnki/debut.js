const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://navi.cnki.net';

module.exports = async (ctx) => {
    const { name } = ctx.params;
    const outlineUrl = `${rootUrl}/knavi/journals/${name}/papers/outline`;

    const response = await got({
        method: 'post',
        url: outlineUrl,
        form: {
            pageIdx: '0',
            type: '2',
            pcode: 'CJFD,CCJD',
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('dd')
        .map((_, item) => ({
            title: $(item).find('span.name > a').text(),
            redirectLink: `${rootUrl}${$(item).find('span.name > a').attr('href')}`,
            pubDate: parseDate($(item).find('span.company').text(), 'YYYY-MM-DD HH:mm:ss'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.redirectLink, async () => {
                const redirectResponse = await got.extend({ followRedirect: false }).get(item.redirectLink);
                item.link = redirectResponse.headers.location;

                const detailResponse = await got.get(item.link);
                const $ = cheerio.load(detailResponse.data);
                const desc = $('div.brief').find('h1').remove().end().html() + $('div.row').html();
                const authorAddSpace = cheerio.load(desc)('h3.author > span').after('<text> </text>').end().html();
                const institutionAddSpace = cheerio.load(authorAddSpace)('h3 > a.author').after('<text> </text>').end().html();
                item.description = institutionAddSpace;

                delete item.redirectLink;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${name} - 全网首发`,
        link: `https://navi.cnki.net/knavi/journals/${name}/detail`,
        item: items,
    };
};
