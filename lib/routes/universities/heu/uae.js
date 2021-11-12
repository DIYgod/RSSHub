const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://uae.hrbeu.edu.cn';

const typeMap = {
    xwdt: {
        name: '新闻动态',
        url: '/3751/list.htm',
    },
    tzgg: {
        name: '通知公告',
        url: '/3752/list.htm',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'xwdt';
    const link = baseUrl + typeMap[type].url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data);

    const urlList = $('.column-news-item')
        .slice(0, 10)
        .map((i, e) => $(e).attr('href'))
        .get();

    const titleList = $('.column-news-item')
        .slice(0, 10)
        .map((i, e) => $('.column-news-title', e).text())
        .get();

    const dateList = $('.column-news-item')
        .slice(0, 10)
        .map((i, e) => $('.column-news-date', e).text())
        .get();

    const out = await Promise.all(
        urlList.map(async (itemUrl, index) => {
            itemUrl = url.resolve(baseUrl, itemUrl);
            if (itemUrl.indexOf('.htm') !== -1) {
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const response = await got.get(itemUrl);
                const $ = cheerio.load(response.data);
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: $('.wp_articlecontent')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                        .trim(),
                    pubDate: dateList[index],
                };
                ctx.cache.set(itemUrl, JSON.stringify(single));
                return Promise.resolve(single);
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '此链接为文件，请点击下载',
                    pubDate: dateList[index],
                };
                return Promise.resolve(single);
            }
        })
    );

    ctx.state.data = {
        title: '水声工程学院-' + typeMap[type].name,
        link,
        item: out,
    };
};
