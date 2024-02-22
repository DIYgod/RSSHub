const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'http://wjw.beijing.gov.cn/';

const config = {
    wnxw: {
        link: '/xwzx_20031/wnxw/',
        title: '委内新闻',
    },
    jcdt: {
        link: '/xwzx_20031/jcdt/',
        title: '基层动态',
    },
    mtjj: {
        link: '/xwzx_20031/mtjj/',
        title: '媒体聚焦',
    },
    rdxws: {
        link: '/xwzx_20031/rdxws/',
        title: '热点新闻',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw new Error('Bad category. See <a href="https://docs.rsshub.app/routes/government#bei-jing-shi-wei-sheng-jian-kang-wei-yuan-hui">docs</a>');
    }

    const current_url = url.resolve(root_url, cfg.link);
    const response = await got({
        method: 'get',
        url: current_url,
    });
    const $ = cheerio.load(response.data);
    const list = $('div.weinei_left_con div.weinei_left_con_line')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[title]');
            return {
                title: a.text(),
                link: url.resolve(current_url, a.attr('href')),
                pubDate: new Date(item.find('div.weinei_left_con_line_date').text() + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);

                item.description = content('div.weinei_left').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '北京卫健委 - ' + cfg.title,
        link: root_url,
        item: items,
    };
};
