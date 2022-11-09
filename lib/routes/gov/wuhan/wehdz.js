const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const root_url = 'http://www.wehdz.gov.cn/';

const config = {
    tz_68628: {
        link: '/2022/ggxw_68627/tz_68628/',
        title: '通知公告'
    },
    ggxw_68629: {
        link: '/2022/ggxw_68627/ggxw_68629/',
        title: '光谷新闻'
    },
    cydt_68630: {
        link: '/2022/ggxw_68627/cydt_68630/',
        title: '产业动态'
    }
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#wu-han-dong-hu-xin-ji-shu-kai-fa-qu">docs</a>');
    }

    const current_url = url.resolve(root_url, cfg.link);
    const response = await got({
        method: 'get',
        url: current_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('.list01-content-containerRight ul li[class!=line]')
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

                item.description = content('div.content_article').html();
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
