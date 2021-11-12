const got = require('@/utils/got');
const cheerio = require('cheerio');
const types = {
    zbxw: {
        name: '中北新闻',
        url: 'http://www.nuc.edu.cn/index/zbxw.htm',
    },
    tzgg: {
        name: '通知公告',
        url: 'http://www.nuc.edu.cn/index/tzgg.htm',
    },
    xshd: {
        name: '学术活动',
        url: 'http://www.nuc.edu.cn/index/xshd.htm',
    },
    jwtz: {
        name: '教务通知',
        url: 'http://jwc.nuc.edu.cn/index/jwtz.htm',
    },
};
const config = {
    jwtz: {
        selector: {
            list: '.winstyle54561 > tbody > tr > td > a',
            title: 'body > center > table:nth-child(2) > tbody > tr > td.bk > table > tbody > tr:nth-child(2) > td > form > div > p:nth-child(1) > span',
            date: 'body > center > table:nth-child(2) > tbody > tr > td.bk > table > tbody > tr:nth-child(2) > td > form > div > div:nth-child(2) > span.c205277_date',
            content: '#vsb_content',
        },
        basePath: 'http://jwc.nuc.edu.cn/',
    },
    other: {
        selector: {
            list: 'body > div.list > div.list_con > div.list_con_rightlist > ul > li',
            title: 'body > div.list > div.list_con > form > div > h2',
            date: 'body > div.list > div.list_con > form > div > div:nth-child(4)',
            content: 'body > div.list > div.list_con > form > div > div:nth-child(6)',
        },
        basePath: 'http://www.nuc.edu.cn/',
    },
};
module.exports = async (ctx) => {
    const type = ctx.params.type || 'zbxw';
    const typeConfig = config[type] || config.other;
    const response = await got({
        method: 'get',
        url: `${typeConfig.basePath}index/${type}.htm`,
    });
    const $ = cheerio.load(response.data);
    const list = $(typeConfig.selector.list).get();
    const out = await Promise.all(
        list.map(async (item) => {
            const liItem = cheerio.load(item);
            const aTag = liItem('a');
            const articleUrl = aTag.attr('href').replace(/\.\./, typeConfig.basePath);
            const cache = await ctx.cache.get(articleUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response = await got({
                method: 'get',
                url: articleUrl,
            });
            const $ = cheerio.load(response.data);
            const title = $(typeConfig.selector.title).text();
            const dateText = $(typeConfig.selector.date).text().split('    ')[0].replace(/时间：/, '').replace(/[年月日]/g, '/').trim();
            let content = $(typeConfig.selector.content).html();
            content = content.replace(/\/__local/g, 'http://www.nuc.edu.cn/__local');
            const data = {
                title,
                link: articleUrl,
                // author,
                description: content,
                pubDate: new Date(dateText),
            };
            ctx.cache.set(articleUrl, JSON.stringify(data));
            return Promise.resolve(data);
        })
    );

    ctx.state.data = {
        title: `${types[type].name} - 中北大学`,
        link: types[type].url,
        description: `${types[type].name} - 中北大学`,
        item: out,
    };
};
