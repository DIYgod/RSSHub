const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const queryString = require('query-string');

const contentUrl = 'https://z.jd.com/bigger/search.html';
const host = 'https://z.jd.com/';
const typeCodes = new Map([
    ['all', { title: '京东众筹 -- 全部', code: '' }],
    ['kj', { title: '京东众筹 -- 科技', code: 10 }],
    ['ms', { title: '京东众筹 -- 美食', code: 36 }],
    ['jd', { title: '京东众筹 -- 家电', code: 37 }],
    ['sj', { title: '京东众筹 -- 设计', code: 12 }],
    ['yl', { title: '京东众筹 -- 娱乐', code: 11 }],
    ['wh', { title: '京东众筹 -- 文化', code: 38 }],
    ['gy', { title: '京东众筹 -- 公益', code: 13 }],
    ['qt', { title: '京东众筹 -- 其他', code: 14 }],
]);

const statusCodes = {
    all: '',
    yrz: 1,
    zcz: 2,
    zccg: 4,
    xmcg: 8,
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'all';
    const status = ctx.params.status || 'all';
    const sort = ctx.params.sort || 'zxsx';

    const title = typeCodes.get(type).title;
    const typeCode = typeCodes.get(type).code;
    const statusCode = statusCodes[status];

    const params = {
        sort,
    };
    if (typeCode !== '') {
        params.categoryId = typeCode;
    }
    if (statusCode !== '') {
        params.status = statusCode;
    }
    const response = await got({
        method: 'post',
        url: contentUrl,
        headers: {
            'Content-type': 'application/x-www-form-urlencoded',
        },
        searchParams: queryString.stringify(params),
    });

    const $ = cheerio.load(response.data);

    const out = $('body > div.wrap.mt20 > div.l-info > div.l-result > ul > li')
        .slice(0, 10)
        .map(function () {
            const image = 'https:' + $(this).find('a.link-pic > img').attr('src');
            const information = $(this).find('div.p-outter > div.p-items > ul').html().trim();
            const description = `<img src="${image}" /><br>${information}`;

            const info = {
                link: url.resolve(host, $(this).find('a.link-pic').attr('href')),
                description,
                title: $(this).find('div.i-tits.no-color-choose > a > h4').text() || $(this).find('div.i-tits > a > h4').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title,
        link: host,
        item: out,
    };
};
