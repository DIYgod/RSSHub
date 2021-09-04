const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    news: {
        link: 'https://news.stcn.com/news',
        title: '要闻',
    },
    gd: {
        link: 'https://www.stcn.com/gd',
        title: '滚动',
    },
    sd: {
        link: 'https://www.stcn.com/sd',
        title: '深度',
    },
    pl: {
        link: 'https://www.stcn.com/pl',
        title: '评论',
    },
};

module.exports = async (ctx) => {
    ctx.params.id = ctx.params.id || 'news';

    const cfg = config[ctx.params.id];
    const currentUrl = cfg.link;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let query = '.tit a';
    if (ctx.params.id === 'gd') {
        query = 'li a[title]';
    }

    const $ = cheerio.load(response.data);
    const list = $(query)
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            let link = item.attr('href');
            if (link.indexOf('.') === 0) {
                link = `${currentUrl}${link.replace('.', '')}`;
            }
            return {
                title: item.text(),
                link,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
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
