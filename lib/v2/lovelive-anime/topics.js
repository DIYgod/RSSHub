const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');
const renderDescription = (desc) => art(path.join(__dirname, 'templates/description.art'), desc);

module.exports = async (ctx) => {
    const abbr = ctx.params.abbr;
    const rootUrl = `https://www.lovelive-anime.jp/${abbr}`;
    const topicsUrlPart = 'yuigaoka' === abbr ? 'topics/' : 'topics.php';
    const baseUrl = `${rootUrl}/${'yuigaoka' === abbr ? 'topics/' : ''}`;
    const abbrDetail = {
        otonokizaka: 'ラブライブ！',
        uranohoshi: 'サンシャイン!!',
        nijigasaki: '虹ヶ咲学園',
        yuigaoka: 'スーパースター!!',
    };
    let url;

    if (ctx.params.hasOwnProperty('category') && ctx.params.category !== 'detail') {
        url = `${rootUrl}/${topicsUrlPart}?cat=${ctx.params.category}`;
    } else {
        url = `${rootUrl}/${topicsUrlPart}`;
    }

    const response = await got(url);

    const $ = cheerio.load(response.data);

    const categoryName = 'uranohoshi' === abbr ? $('div.llbox > p').text() : $('div.category_title > h2').text();

    let items = $('ul.listbox > li')
        .map((_, item) => {
            item = $(item);

            const link = `${baseUrl}${item.find('div > a').attr('href')}`;
            const pubDate = parseDate(item.find('a > p.date').text(), 'YYYY/MM/DD');
            const title = item.find('a > p.title').text();
            const category = item.find('a > p.category').text();
            const imglink = `${baseUrl}${
                item
                    .find('a > img')
                    .attr('style')
                    .match(/background-image:url\((.*)\)/)[1]
            }`;

            return {
                link,
                pubDate,
                title,
                category,
                description: renderDescription({
                    title,
                    imglink,
                }),
            };
        })
        .get();

    if (ctx.params.option === 'detail' || ctx.params.category === 'detail') {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResp = await got(item.link);
                    const $ = cheerio.load(detailResp.data);

                    const content = $('div.p-page__detail.p-article');
                    for (const v of content.find('img')) {
                        v.attribs.src = `${baseUrl}${v.attribs.src}`;
                    }
                    item.description = content.html();
                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: `${categoryName} - ${abbrDetail[abbr]} - Love Live Official Website Topics`,
        link: url,
        item: items,
    };
};
