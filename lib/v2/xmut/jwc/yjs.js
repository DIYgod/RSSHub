const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const xmut = 'https://yjs.xmut.edu.cn';

module.exports = async (ctx) => {
    const { category = 'yjsc' } = ctx.params;
    const url = `${xmut}/index/${category}.htm`;
    const res = await got(url, {
        headers: {
            referer: xmut,
        },
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(res.data);
    const items = $('.mainWrap .main_con .main_conR ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('em').text(),
                link: `${xmut}/` + item.find('a').attr('href'),
                pubDate: parseDate(item.find('span').text()),
            };
        });
    const itemPromises = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    headers: {
                        referer: xmut,
                    },
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $item = cheerio.load(detailResponse.data);
                const content = $item('body .mainWrap .main_content .v_news_content').html();
                item.description = content;
                return item;
            })
        )
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: itemPromises,
    };
};
