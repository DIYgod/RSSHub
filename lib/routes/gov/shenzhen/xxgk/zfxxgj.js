const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://www.sz.gov.cn/cn/xxgk/zfxxgj/';

const config = {
    tzgg: {
        link: 'tzgg/',
        title: '通知公告',
    },
    zjxx: {
        link: 'zjxx/szfczyjs/',
        title: '资金信息',
    },
    zfcg: {
        link: 'zfcg/zfcgml',
        title: '政府采购',
    },
    zdxm: {
        link: 'zdxm',
        title: '重大项目',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#guang-dong-sheng-jiao-yu-ting">docs</a>');
    }

    const currentUrl = url.resolve(rootUrl, cfg.link);
    const response = await got({ method: 'get', url: currentUrl });
    const $ = cheerio.load(response.data);
    const list = $('div.zx_ml_list ul li span.tit')
        .map((_, item) => {
            item = $(item).find('a');
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({ method: 'get', url: item.link });
                const content = cheerio.load(detailResponse.data);
                item.description = content('div.concent_center').html();
                item.pubDate = new Date(
                    content('td[align="right"]')
                        .text()
                        .replace(/发布日期：/, '') + ' GMT+8'
                ).toUTCString();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '广东省深圳市人民政府 - ' + cfg.title,
        link: currentUrl,
        item: items,
    };
};
