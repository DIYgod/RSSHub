const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const root_url = 'http://kjj.wuhan.gov.cn/';

const config = {
    tzgg: {
        link: '/wmfw/tzgg/tzgg_18371/',
        title: '通知公告',
    },
    gsxx: {
        link: '/wmfw/tzgg/gsxx/',
        title: '公示信息',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#wu-han-shi-ke-xue-ji-shu-ju">docs</a>');
    }

    const current_url = url.resolve(root_url, cfg.link);
    const response = await got({
        method: 'get',
        url: current_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.list_news li')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a[href]');
            const span = item.find('span');
            return {
                title: a.text(),
                link: url.resolve(current_url, a.attr('href')),
                pubDate: parseDate(span.text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = cheerio.load(res.data);

                item.description = content('div.art_content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '武汉科技局 - ' + cfg.title,
        link: root_url,
        item: items,
    };
};
