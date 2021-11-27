const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://kuaixun.stcn.com';

const config = {
    '': {
        link: rootUrl,
        title: '快讯',
    },
    egs: {
        link: `${rootUrl}/egs/`,
        title: 'e公司',
    },
    yb: {
        link: `${rootUrl}/yb/`,
        title: '研报',
    },
    ss: {
        link: `${rootUrl}/ss/`,
        title: '时事',
    },
    cj: {
        link: `${rootUrl}/cj/`,
        title: '财经',
    },
};

module.exports = async (ctx) => {
    ctx.params.id = ctx.params.id || '';

    const cfg = config[ctx.params.id];

    const currentUrl = cfg.link;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('#news_list2 li a')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            let link = item.attr('href');
            if (link.indexOf('.') === 0) {
                link = `${currentUrl}${link.replace('.', '')}`;
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

                item.title = title.text().replace('为你推荐', '');
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
