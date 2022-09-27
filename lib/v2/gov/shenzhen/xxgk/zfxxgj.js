const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
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
        throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#guang-dong-sheng-ren-min-zheng-fu-guang-dong-sheng-shen-zhen-shi-ren-min-zheng-fu">docs</a>');
    }

    const currentUrl = new URL(cfg.link, rootUrl).href;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    const list = $('div.zx_ml_list ul li span.tit')
        .toArray()
        .map((item) => {
            item = $(item).find('a');
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);
                item.description = content('div.news_cont_d_wrap').html();
                if (content('div.fjdown').html() !== null) {
                    item.description += content('div.fjdown').html();
                }
                item.pubDate = timezone(
                    parseDate(
                        content('.tit span:nth-child(2)')
                            .text()
                            .replace(/信息提供日期：/, '')
                    ),
                    8
                );
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
