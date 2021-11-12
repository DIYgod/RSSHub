const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://ljxq.cq.gov.cn';

const config = {
    lzyj: {
        link: '/zwgk_199/fdzdgknr/zcwj/',
        title: '履职依据',
    },
    gsgg: {
        link: '/zwgk_199/fdzdgknr/gggs/',
        title: '公示公告',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#zhong-qing-shi-ren-min-zheng-fu-liang-jiang-xin-qu-xin-xi-gong-kai-wang-zheng-wu-gong-kai">docs</a>');
    }

    const currentUrl = url.resolve(rootUrl, cfg.link);
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);

    $('tr.cwx-tit').remove();

    const list = $('table.cwx-table tbody tr')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');

            return {
                title: a.text(),
                link: url.resolve(currentUrl, a.attr('href')),
                pubDate: new Date(item.find('td').eq(2).text() + ' GMT+8').toUTCString(),
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

                item.description = content('div.zwxl-main').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `两江新区信息公开网 - ${cfg.title}`,
        link: rootUrl,
        item: items,
    };
};
