const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://jwc.xidian.edu.cn';

module.exports = async (ctx) => {
    const { category = 'tzgg' } = ctx.params;
    const url = `${baseUrl}/${category}.htm`;
    const response = await got(url, {
        headers: {
            referer: baseUrl,
        },
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(response.data);

    let items = $('.list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.con span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        referer: url,
                    },
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = cheerio.load(detailResponse.data);
                content('.tit, .zd, #div_vote_id').remove();
                item.description = content('.con').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: items,
    };
};
