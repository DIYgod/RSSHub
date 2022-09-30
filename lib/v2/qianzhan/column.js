const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    let rootUrl = 'https://www.qianzhan.com/analyst/';
    const titles = {
        all: '最新文章',
        220: '研究员专栏',
        627: '规划师专栏',
        329: '观察家专栏',
    };
    const { type = 'all' } = ctx.params;

    if (type !== 'all') {
        rootUrl = rootUrl + 'list/' + type + '.html';
    }

    const response = await got(rootUrl);
    const $ = cheerio.load(response.data);
    const links = $('.ptb30.bb1e.clf .f22 a').map((_, item) => $(item).attr('href'));

    const items = await Promise.all(
        links.map((_, item) =>
            ctx.cache.tryGet(item, async () => {
                const detailResponse = await got(item);
                const $ = cheerio.load(detailResponse.data);
                const description = $('#divArtBody').html();
                const title = $('#h_title').text();
                const pubDate = timezone(parseDate($('#pubtime_baidu').text().split('• ')[1], 'YYYY-MM-DD HH:mm:ss'), +8);
                const author = $('.bljjxue').text().match(/\S+/)[0];
                return {
                    title,
                    link: item,
                    description,
                    pubDate,
                    author,
                    category: $('meta[name="Keywords"]').attr('content').split(','),
                };
            })
        )
    );

    ctx.state.data = {
        title: `前瞻经济学人 - ${titles[type]}`,
        link: rootUrl,
        item: items,
    };
};
