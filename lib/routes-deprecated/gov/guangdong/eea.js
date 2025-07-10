const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const rootUrl = 'http://eea.gd.gov.cn/';

const config = {
    kszs: { link: '/bmbk/kszs/', title: '考试招生' },
    shks: { link: '/shks/', title: '社会考试' },
    zkgs: { link: '/zwgk_zkgs/', title: '招考公示' },
    bkzn: { link: '/bmbk/bkzn/', title: '报考指南' },
    ywdt: { link: '/news/', title: '要闻动态' },
    gkzl: { link: '/zwgk/gkzl/', title: '公开专栏' },
    zcwj: { link: '/zwgk/zwwj/', title: '政策文件' },
    zcjd: { link: '/zcjd/', title: '政策解读' },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw new Error('Bad category. See <a href="https://docs.rsshub.app/routes/government#guang-dong-sheng-ren-min-zheng-fu-guang-dong-sheng-jiao-yu-kao-shi-yuan">docs</a>');
    }

    const currentUrl = url.resolve(rootUrl, cfg.link);
    const response = await got({ method: 'get', url: currentUrl });

    const $ = cheerio.load(response.data);
    const list = $('div.main>div.content>ul>li')
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
                if (item.link.includes('weixin.qq.com')) {
                    return item;
                }
                const detailResponse = await got({ method: 'get', url: item.link });
                const content = cheerio.load(detailResponse.data);
                item.description = content('div.article').html();
                item.pubDate = timezone(parseDate(content('span.time').text()), +8);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '广东省教育考试院 - ' + cfg.title,
        link: currentUrl,
        item: items,
    };
};
