const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    data: {
        link: 'https://data.stcn.com',
        title: '数据',
    },
    jqrxw: {
        link: 'https://data.stcn.com/jqrxw',
        title: '机器人新闻',
    },
};

module.exports = async (ctx) => {
    ctx.params.id = ctx.params.id || 'data';

    const cfg = config[ctx.params.id];

    const rootUrl = 'https://data.stcn.com';
    const currentUrl = cfg.link;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let query = 'dt a';
    if (ctx.params.id === 'jqrxw') {
        query = '#news_list2 li a[title]';
    }

    const $ = cheerio.load(response.data);
    const list = $(query)
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            let link = item.attr('href');
            if (link.indexOf('..') === 0) {
                link = `${rootUrl}${link.replace('..', '')}`;
            } else if (link.indexOf('.') === 0) {
                link = `${rootUrl}${link.replace('.', '')}`;
            }
            return {
                link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                let info = content('div.info');

                if (info.html() === null) {
                    info = content('h2 span');
                    info.find('i').remove();
                } else {
                    info.find('span').remove();
                }
                item.pubDate = new Date(info.text().split('来源')[0].trim()).toUTCString();

                const title = content('h2');
                title.find('span').remove();

                item.title = title.text().replace('点击排行榜', '');
                item.description = content('#ctrlfscont').html() || content('.text').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '证券时报网 - ' + cfg.title,
        link: currentUrl,
        item: items,
    };
};
