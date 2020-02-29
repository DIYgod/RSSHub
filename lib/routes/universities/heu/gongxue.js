const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

const baseUrl = 'http://gongxue.cn';

const typeMap = {
    yw: {
        name: '要闻',
        url: '/news/ShowClass.asp?ClassID=4383',
    },
    sx: {
        name: '时讯',
        url: '/news/ShowClass.asp?ClassID=4315',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'yw';
    const link = baseUrl + typeMap[type].url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: baseUrl,
        },
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(responseHtml);

    const urlList = $('.wenzhangzhengwen tr:nth-child(-n+20)')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('href'))
        .get();

    const titleList = $('.wenzhangzhengwen tr:nth-child(-n+20)')
        .slice(0, 10)
        .map((i, e) => $('a', e).text())
        .get();

    const dateList = $('.wenzhangzhengwen tr:nth-child(-n+20)')
        .slice(0, 10)
        .map((i, e) => $('td[align="right"]', e).text())
        .get();

    const out = await Promise.all(
        urlList.map(async (itemUrl, index) => {
            itemUrl = url.resolve(baseUrl, itemUrl);
            if (itemUrl.indexOf('.html') !== -1) {
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const response = await got({
                    method: 'get',
                    url: itemUrl,
                    responseType: 'buffer',
                });
                const responseHtmlItem = iconv.decode(response.data, 'gbk');
                const $ = cheerio.load(responseHtmlItem);
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: $('.wenzhangzhengwen').html(),
                    pubDate: '2020-' + dateList[index],
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
        title: '工学网-' + typeMap[type].name,
        link: link,
        item: out,
    };
};
