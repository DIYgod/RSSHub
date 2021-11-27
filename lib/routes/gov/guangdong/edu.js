const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://edu.gd.gov.cn/';

const config = {
    tzgg: {
        link: '/zxzx/tzgg/',
        title: '通知公告',
    },
    btxx: {
        link: '/zxzx/btxx/',
        title: '本厅信息',
    },
    xwfb: {
        link: '/zxzx/xwfb/',
        title: '新闻发布',
    },
    mtjj: {
        link: '/zxzx/mtjj/',
        title: '媒体聚焦',
    },
    gdjy: {
        link: '/zxzx/gdjy/',
        title: '广东教育',
    },
    jydt: {
        link: '/zxzx/jydt/',
        title: '教育动态',
    },
    tpxw: {
        link: '/zxzx/tpxw/',
        title: '图片新闻',
    },
    zscd: {
        link: '/zxzx/tzgg/',
        title: '政声传递',
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
    const list = $('div.list_list ul li')
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
                item.pubDate = new Date(content('td[align="right"]').text().replace(/发布日期：/, '') + ' GMT+8').toUTCString();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '广东省教育厅 - ' + cfg.title,
        link: currentUrl,
        item: items,
    };
};
