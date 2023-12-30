const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

const baseUrl = 'https://www.csc.edu.cn';

const typeMap = {
    lxtz: {
        name: '遴选通知',
        url: '/chuguo/list/24',
    },
    xmzl: {
        name: '综合项目专栏',
        url: '/chuguo/list/26',
    },
    wtjd: {
        name: '常见问题解答',
        url: '/chuguo/list/27',
    },
    lqgg: {
        name: '录取公告',
        url: '/chuguo/list/28',
    },
    xwzx: {
        name: '新闻资讯',
        url: '/news',
    },
    xwgg: {
        name: '新闻公告',
        url: '/news/gonggao',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'jjyw';
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

    const urlList = $('.list-a li')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('href'))
        .get();

    const titleList = $('.list-a li')
        .slice(0, 10)
        .map((i, e) => $('a', e).attr('title'))
        .get();

    const dateList = $('.list-a li')
        .slice(0, 10)
        .map((i, e) => $('span', e).text())
        .get();

    const out = await Promise.all(
        urlList.map(async (itemUrl, index) => {
            itemUrl = url.resolve(baseUrl, itemUrl);

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
                description: $('.contents')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                    .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                    .trim(),
                pubDate: dateList[index],
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '国家留学网-' + typeMap[type].name,
        link,
        item: out,
    };
};
