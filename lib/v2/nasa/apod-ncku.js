const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;
    const rootUrl = 'http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/archivepix.html';
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('body > b > a')
        .slice(0, limit)
        .map((_, el) => ({
            title: $(el).text(),
            link: `http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/${$(el).attr('href')}`,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                const description = `<img src="${content('img').attr('src')}"> <br> ${content('body > center').eq(1).html()} <br> ${content('body > p').eq(0).html()}`;
                const pubDate = parseDate(item.link.slice(-11, -5), 'YYMMDD');

                const single = {
                    title: item.title,
                    description,
                    pubDate,
                    link: item.link,
                };
                return single;
            })
        )
    );

    ctx.state.data = {
        title: 'NASA 每日一天文圖 (成大物理分站) ',
        link: rootUrl,
        item: items,
    };
};
