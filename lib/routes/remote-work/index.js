const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'https://yuancheng.work/';

const config = {
    all: {
        link: '/',
        title: 'Remote Work|远程工作',
    },
    development: {
        link: '/remote-development-jobs',
        title: 'Remote Work-Development|远程工作-技术',
    },
    design: {
        link: '/remote-design-jobs',
        title: 'Remote Work-Design|远程工作-设计',
    },
    operation: {
        link: '/remote-operation-jobs',
        title: 'Remote Work-Operation|远程工作-运营',
    },
    product: {
        link: '/remote-product-jobs',
        title: 'Remote Work-Product|远程工作-产品',
    },
    other: {
        link: '/remote-other-jobs',
        title: 'Remote Work-Other|远程工作-其他',
    },
    marketing: {
        link: '/remote-marketing-jobs',
        title: 'Remote Work-Marketing|远程工作-市场',
    },
    sales: {
        link: '/remote-sales-jobs',
        title: 'Remote Work-Sales|远程工作-销售',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.caty || 'all'];
    if (!cfg) {
        throw Error('Bad category');
    }

    const current_url = url.resolve(root_url, cfg.link);
    const response = await got({
        method: 'get',
        url: current_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.list-group div.job')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a.job-title');
            let title = a.attr('title');
            item.find('div.job-meta span.job-meta-value').each((_, tag) => {
                title += '|' + $(tag).text();
            });
            return {
                title: title,
                link: a.attr('href'),
                pubDate: new Date(item.find('div.job-foot div.job-date').attr('date') + ' GMT+8').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet('remote-work' + item.link, async () => {
                    const res = await got({ method: 'get', url: url.resolve(root_url, item.link) });
                    const content = cheerio.load(res.data);
                    item.description = content('div.container div.main div.job-section').first().html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: cfg.title,
        link: current_url,
        item: items,
    };
};
