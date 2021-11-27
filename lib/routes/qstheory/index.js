const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://www.qstheory.cn/';

const config = {
    toutiao: {
        title: '头条',
        url: `${rootUrl}/v9zhuanqu/toutiao/index.htm`,
    },
    qswp: {
        title: '网评',
        url: `${rootUrl}/qswp.htm`,
    },
    qssp: {
        title: '视频',
        url: `${rootUrl}/qssp/index.htm`,
    },
    qslgxd: {
        title: '原创',
        url: `${rootUrl}/qslgxd/index.htm`,
    },
    economy: {
        title: '经济',
        url: `${rootUrl}/economy/index.htm`,
    },
    politics: {
        title: '政治',
        url: `${rootUrl}/politics/index.htm`,
    },
    culture: {
        title: '文化',
        url: `${rootUrl}/culture/index.htm`,
    },
    society: {
        title: '社会',
        url: `${rootUrl}/society/index.htm`,
    },
    cpc: {
        title: '党建',
        url: `${rootUrl}/cpc/index.htm`,
    },
    science: {
        title: '科教',
        url: `${rootUrl}/science/index.htm`,
    },
    zoology: {
        title: '生态',
        url: `${rootUrl}/zoology/index.htm`,
    },
    defense: {
        title: '国防',
        url: `${rootUrl}/defense/index.htm`,
    },
    international: {
        title: '国际',
        url: `${rootUrl}/international/index.htm`,
    },
    books: {
        title: '图书',
        url: `${rootUrl}/books/index.htm`,
    },
    xxbj: {
        title: '学习笔记',
        url: `${rootUrl}/qszq/xxbj/index.htm`,
    },
};

module.exports = async (ctx) => {
    const category = ctx.params.category || 'toutiao';

    const currentUrl = config[category].url;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.list-style1 ul li a, .text h2 a, .no-pic ul li a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
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

                content('.fs-text, .fs-pinglun, .hidden-xs').remove();

                item.author = content('.appellation').text();
                item.description = content('.highlight, .text').html() || content('.content').html();
                item.pubDate = new Date(content('.puttime_mobi, .pubtime, .headtitle span').text().replace('发表于', '').replace(/(年|月)/g, '-').replace('日', '')).toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
