const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const getCookie = require('../utils/pypasswaf');
const host = 'https://cs.nuaa.edu.cn/';

const map = new Map([
    ['tzgg', { title: '通知公告 | 南京航空航天大学计算机科学与技术学院', suffix: 'tzgg/list.htm' }],
    ['rdxw', { title: '热点新闻 | 南京航空航天大学计算机科学与技术学院', suffix: '10846/list.htm' }],
    ['xkky', { title: '学科科研 | 南京航空航天大学计算机科学与技术学院', suffix: '10849/list.htm' }],
    ['be', { title: '本科生培养 | 南京航空航天大学计算机科学与技术学院', suffix: '10850/list.htm' }],
    ['me', { title: '研究生培养 | 南京航空航天大学计算机科学与技术学院', suffix: '10851/list.htm' }],
    ['jxdt', { title: '教学动态 | 南京航空航天大学计算机科学与技术学院', suffix: '1977/list.htm' }],
    ['xsgz', { title: '学生工作 | 南京航空航天大学计算机科学与技术学院', suffix: '1959/list.htm' }],
]);

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const getDescription = Boolean(ctx.params.getDescription) || false;
    const suffix = map.get(type).suffix;

    const link = new URL(suffix, host).href;
    const cookie = await getCookie(host);
    const gotConfig = {
        headers: {
            cookie,
        },
    };
    const response = await got(link, gotConfig);
    const $ = cheerio.load(response.data);

    const list = $('#news_list ul li')
        .slice(0, Math.min(parseInt($('.per_count', '#wp_paging_w6').text()), parseInt($('.all_count', '#wp_paging_w6').slice(1).text())))
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
            const itemUrl = new URL(info.link, host).href;
            let description = title + '<br><a href="' + itemUrl + '" target="_blank">查看原文</a>';

            if (getDescription) {
                description = await ctx.cache.tryGet(itemUrl, async () => {
                    const arr = itemUrl.split('.');
                    const pageType = arr[arr.length - 1];
                    if (pageType === 'htm' || pageType === 'html') {
                        const response = await got(itemUrl, gotConfig);
                        const $ = cheerio.load(response.data);
                        return $('.wp_articlecontent').html() + '<br><hr /><a href="' + itemUrl + '" target="_blank">查看原文</a>';
                    }
                });
            }

            return {
                title,
                link: itemUrl,
                description,
                pubDate: parseDate(date),
            };
        })
    );

    ctx.state.data = {
        title: map.get(type).title,
        link,
        description: '南京航空航天大学计算机科学与技术学院RSS',
        item: out,
    };
};
