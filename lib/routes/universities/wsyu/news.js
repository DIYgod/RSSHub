const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://www.wsyu.edu.cn';

const typeMap = {
    xxyw: {
        name: '学校要闻',
        url: '/info/iList.jsp?cat_id=10307',
    },
    zhxw: {
        name: '综合新闻',
        url: '/info/iList.jsp?cat_id=10119',
    },
    mtjj: {
        name: '媒体聚焦',
        url: '/info/iList.jsp?cat_id=10120',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'xxyw';
    const link = baseUrl + typeMap[type].url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = cheerio.load(response.data);

    const urlList = $('.mainContent li')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('href'))
        .get();

    const titleList = $('.mainContent li')
        .slice(0, 10)
        .map((i, e) => $('a', e).text())
        .get();

    const dateList = $('.mainContent li')
        .slice(0, 10)
        .map((i, e) => $('span', e).text())
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
                $('.content .photos').remove();
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: $('.content').html(),
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
        title: '武昌首义学院-' + typeMap[type].name,
        link,
        item: out,
    };
};
