const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    index: {
        link: 'https://www.adquan.com/',
        title: '首页',
    },
    info: {
        link: 'https://www.adquan.com/info',
        title: '行业观察',
    },
    creative: {
        link: 'https://creative.adquan.com/',
        title: '案例库',
    },
};

module.exports = async (ctx) => {
    const cfg = ctx.params.type ? config[ctx.params.type] : config.index;

    const response = await got({
        method: 'get',
        url: cfg.link,
    });
    const $ = cheerio.load(response.data);

    let where;
    switch (cfg.title) {
        case '首页':
            where = $('div.w_l_inner h2.wrok_l_title a');
            break;
        case '行业观察':
            where = $('div.article_rel div.rel_write a p').parent();
            break;
        case '案例库':
            where = $('#showcontent li h2 a');
            break;
    }

    const list = where
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: url.resolve(cfg.link, item.attr('href')),
            };
        })
        .get();

    ctx.state.data = {
        title: `广告网 - ${cfg.title}`,
        link: cfg.link,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(detailResponse.data);
                    item.pubDate = new Date(content('p.text_time2 span').eq(0).text()).toUTCString();
                    item.description = content('div.con_Text').html();
                    return item;
                })
            )
        ),
    };
};
