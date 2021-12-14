const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://www.guanggoo.com/';

const config = {
    index: {
        link: '',
        title: '首页',
    },
    qna: {
        link: '/node/qna',
        title: '你问我答',
    },
    lowshine: {
        link: '/node/lowshine',
        title: '同城活动',
    },
    it: {
        link: '/node/IT',
        title: 'IT技术',
    },
    finance: {
        link: '/node/finance',
        title: '金融财经',
    },
    startup: {
        link: '/node/startup',
        title: '创业创客',
    },
    city: {
        link: '/node/city',
        title: '城市建设',
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'index';

    const cfg = config[category];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/bbs.html#guang-gu-she-qu-zi-lun-tan">docs</a>');
    }

    const currentUrl = url.resolve(rootUrl, cfg.link);
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.topic-item h3 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: url.resolve(rootUrl, item.attr('href').split('#')[0]),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);

                item.description = content('div.sidebar-left').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '光谷社区 - ' + cfg.title,
        link: rootUrl,
        item: items,
    };
};
