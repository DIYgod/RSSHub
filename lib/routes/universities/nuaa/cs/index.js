const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const getCookie = require('../utils/pypasswaf');
const host = 'http://cs.nuaa.edu.cn/';

const map = new Map([
    ['tzgg', { title: '南京航空航天大学计算机科学与技术学院 -- 通知公告', suffix: '1995/list.htm' }],
    ['xwdt', { title: '南京航空航天大学计算机科学与技术学院 -- 新闻动态', suffix: '1997/list.htm' }],
    ['kydt', { title: '南京航空航天大学计算机科学与技术学院 -- 科研动态', suffix: '1975/list.htm' }],
    ['jxdt', { title: '南京航空航天大学计算机科学与技术学院 -- 教学动态', suffix: '1977/list.htm' }],
    ['xsgz', { title: '南京航空航天大学计算机科学与技术学院 -- 学生工作', suffix: '1959/list.htm' }],
    ['zsxx', { title: '南京航空航天大学计算机科学与技术学院 -- 招生信息', suffix: '1993/list.htm' }],
    ['jyxx', { title: '南京航空航天大学计算机科学与技术学院 -- 就业信息', suffix: '1994/list.htm' }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type || 'tzgg';
    const suffix = map.get(type).suffix;

    const link = url.resolve(host, suffix);
    const cookie = await getCookie();
    const gotConfig = {
        headers: {
            cookie,
        },
    };
    const response = await got.get(link, gotConfig);
    const $ = cheerio.load(response.data);

    const list = $('#news_list > ul > li')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('a').attr('title'),
                link: $(this).find('a').attr('href'),
                date: $(this).find('span').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title || 'tzgg';
            const date = info.date;
            const itemUrl = url.resolve(host, info.link);

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const arr = itemUrl.split('.');
            const pageType = arr[arr.length - 1];

            let description = itemUrl;
            if (pageType === 'htm' || pageType === 'html') {
                const response = await got.get(itemUrl, gotConfig);
                const $ = cheerio.load(response.data);
                description = $('.wp_articlecontent')
                    .html()
                    .replace(/src="\//g, `src="${url.resolve(host, '.')}`)
                    .trim();
            }

            const single = {
                title: title,
                link: itemUrl,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: map.get(type).title,
        link: link,
        description: '南京航空航天大学计算机科学与技术学院RSS',
        item: out,
    };
};
