const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://zxls.dgjyw.com/';

const config = {
    news: {
        link: '/node/57620',
        title: '动态',
    },
    announcement: {
        link: '/node/57725',
        title: '公示',
    },
    notice: {
        link: '/node/57621',
        title: '通知',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.type];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/other.html#dong-guan-jiao-yan-wang">docs</a>');
    }

    const currentUrl = url.resolve(rootUrl, cfg.link);
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.list-ul')
        .eq(2)
        .find('li')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(new Date().getFullYear().toString().substr(0, 2) + item.find('span').text()).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);

                item.description = content('div.text').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '东莞教研网 - ' + cfg.title,
        link: rootUrl,
        item: items,
    };
};
