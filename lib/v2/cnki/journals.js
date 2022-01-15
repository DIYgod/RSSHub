const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://navi.cnki.net';

module.exports = async (ctx) => {
    const { name } = ctx.params;
    const journalUrl = `${rootUrl}/knavi/journals/${name}/detail`;
    const title = await got.get(journalUrl).then((res) => {
        const $ = cheerio.load(res.data);

        return $('head > title').text();
    });

    const yaerListUrl = `${rootUrl}/knavi/journals/${name}/yearList?pIdx=0`;
    const journalsInfo = await got.get(yaerListUrl).then((res) => {
        const $ = cheerio.load(res.data);
        const yearIssue = $('dd').find('a').first().attr('value');
        const date = $('dd').find('a').first().attr('id').replace('yq', '');

        return {
            yearIssue,
            date,
        };
    });

    const papersUrl = `${rootUrl}/knavi/journals/${name}/papers?yearIssue=${journalsInfo.yearIssue}&pageIdx=0&pcode=CJFD,CCJD`;
    const list = await got.get(papersUrl).then((res) => {
        const $ = cheerio.load(res.data);
        const item = $('span.name')
            .map((_, item) => ({
                title: $(item).find('a').text(),
                redirectLink: rootUrl + $(item).find('a').attr('href'),
                pubDate: parseDate(journalsInfo.date, 'YYYYMM'),
            }))
            .get();

        return item;
    });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.redirectLink, async () => {
                const redirectLinkResponse = await got.extend({ followRedirect: false }).get(item.redirectLink);
                item.link = redirectLinkResponse.headers.location;

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
        title: String(title),
        link: `https://navi.cnki.net/knavi/journals/${name}/detail`,
        item: items,
    };
};
