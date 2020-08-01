const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const rootUrl = 'http://www.cs.com.cn/';

const config = {
    zzkx: {
        link: '/sylm/jsbd/',
        title: '中证快讯',
    },
    hyzx: {
        link: '/cj/hyzx/',
        title: '行业资讯',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/finance.html#zhong-zheng-wang-zi-xun">docs</a>');
    }

    const currentUrl = url.resolve(rootUrl, cfg.link);
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const list = $('ul.list-lm li')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve(currentUrl, a.attr('href')),
                pubDate: new Date(item.find('span').text()).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link, responseType: 'buffer' });
                    const content = cheerio.load(iconv.decode(res.data, 'gbk'));

                    item.description = content('div.article-t').html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '中证网 - ' + cfg.title,
        link: rootUrl,
        item: items,
    };
};
