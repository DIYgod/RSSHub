const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const root_url = 'http://www.wehdz.gov.cn/';

const config = {
    tz: {
        link: '/tzgg_53/tz/',
        title: '通知',
    },
    gg: {
        link: '/tzgg_53/gg/',
        title: '公告',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw new Error('Bad category. See <a href="https://docs.rsshub.app/routes/government#wu-han-dong-hu-xin-ji-shu-kai-fa-qu">docs</a>');
    }

    const current_url = url.resolve(root_url, cfg.link);
    const response = await got({
        method: 'get',
        url: current_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.main-list li[class!=line]')
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

                item.description = content('div.dhgx_content_box').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '武汉东湖高新 - ' + cfg.title,
        link: root_url,
        item: items,
    };
};
