const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const domain = 'gks.mof.gov.cn';
const theme = 'guozaiguanli';

module.exports = async (ctx) => {
    const { category = 'gzfxgzdt' } = ctx.params;
    const currentUrl = `https://${domain}/ztztz/${theme}/${category}/`;
    const { data: response } = await got(currentUrl);
    const $ = cheerio.load(response);
    const title = $('title').text();
    const author = $('div.zzName').text();
    const siteName = $('meta[name="SiteName"]').prop('content');
    const description = $('meta[name="ColumnDescription"]').prop('content');
    const indexes = $('ul.liBox li')
        .toArray()
        .map((li) => {
            const a = $(li).find('a');
            const pubDate = $(li).find('span').text();
            const href = a.prop('href');
            const link = href.startsWith('http') ? href : new URL(href, currentUrl).href;
            return {
                title: a.prop('title'),
                link,
                pubDate: timezone(parseDate(pubDate), +8),
            };
        });

    const items = await Promise.all(
        indexes.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const content = cheerio.load(detailResponse);
                item.description = content('div.my_doccontent').html();
                item.author = author;
                return item;
            })
        )
    );

    ctx.state.data = {
        item: items,
        title,
        link: currentUrl,
        description: `${description} - ${siteName}`,
        author,
    };
};
