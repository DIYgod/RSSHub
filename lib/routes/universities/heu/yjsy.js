const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://yjsy.hrbeu.edu.cn';

const typeMap = {
    announcement: {
        name: '通知公告',
        url: '/2981/list.htm',
    },
    news: {
        name: '新闻动态',
        url: '/2980/list.htm',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'announcement';
    const link = baseUrl + typeMap[type].url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data);

    const urlList = $('.wp_article_list .list_item')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('href'))
        .get();

    const titleList = $('.wp_article_list .list_item')
        .slice(0, 10)
        .map((i, e) => $('a', e).text())
        .get();

    const dateList = $('.wp_article_list .list_item')
        .slice(0, 10)
        .map((i, e) => $('.Article_PublishDate', e).text())
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
        title: '哈尔滨工程大学研究生院' + typeMap[type].name,
        link: link,
        item: out,
    };
};
