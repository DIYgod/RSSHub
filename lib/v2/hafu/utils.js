const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

const typeMap = {
    ggtz: ['https://www.hafu.edu.cn/index/ggtz.htm', 'https://www.hafu.edu.cn/', '河南财院 - 公告通知', ggtzParse],
    jwc: ['https://jwc.hafu.edu.cn/tzgg.htm', 'https://jwc.hafu.edu.cn/', '河南财院 教务处 - 公告通知', jwcParse],
    zsjyc: ['https://zsjyc.hafu.edu.cn/tztg.htm', 'https://zsjyc.hafu.edu.cn/', '河南财院 招生就业处 - 公告通知', zsjycParse],
};
// Number of get articles
let Limit = 10;

module.exports = async (ctx, type) => {
    const link = typeMap[type][0];
    const title = typeMap[type][2];

    const response = await got(link);
    const $ = cheerio.load(response.data);

    Limit = ctx.query.limit || Limit;

    // call the Parse Function like 'ggtzParse(ctx, $)' for the type 'ggtz'
    const resultList = typeMap[type][3](ctx, $);

    return {
        title,
        link,
        resultList,
    };
};

function ggtzParse(ctx, $) {
    const data = $('a[class=c269582]').parent().slice(0, Limit);
    const resultItems = data
        .map(async (_, item) => {
            const title = $(item).find('a[class=c269582]').attr('title');
            // .slice(3) for cut out str '../' in original link
            const href = $(item).find('a[class=c269582]').attr('href').slice(3);
            const link = typeMap.ggtz[1] + href;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            let description = '';
            let articleData = '';
            // for some unexpected href link
            try {
                const articleRes = await got.get(link);
                articleData = cheerio.load(articleRes.data);
                const articleBody = articleData('div[class=v_news_content]').html().slice(1);
                description = art(path.join(__dirname, 'templates/hafu.art'), articleBody)();
            } catch {
                description = href;
            }
            const header = articleData('h1').next().text();
            const index = header.indexOf('日期');

            const author = header.substring(0, index - 2) || '';
            // form articlePage || hostPage
            const Date = header.substring(index + 3, index + 19) || $(item).find('a[class=c269582_date]');
            const pubDate = parseDate(Date, 'YYYY-MM-DD HH-mm') || parseDate(Date, 'YYYY-MM-DD  ');

            const result = {
                title,
                description,
                pubDate: timezone(pubDate, +8),
                link,
                author,
            };
            //                                                 cache expiretime 120mins
            ctx.cache.set(link, JSON.stringify(result), config.cache.contentExpire * 24);
            return result;
        })
        .get();

    return resultItems;
}

function jwcParse(ctx, $) {
    const data = $('a[class=c259713]').parent().parent().slice(0, Limit);
    const resultItems = data
        .map(async (_, item) => {
            const title = $(item).find('a[class=c259713]').attr('title');
            const href = $(item).find('a[class=c259713]').attr('href');
            const link = typeMap.jwc[1] + href;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            let description = '';
            let articleData = '';
            // for some unexpected href link
            try {
                const articleRes = await got.get(link);
                articleData = cheerio.load(articleRes.data);
                const articleBody = articleData('div[class=v_news_content]').html();
                description = art(path.join(__dirname, 'templates/hafu.art'), articleBody)();
            } catch {
                description = href;
            }

            const author = articleData('span[class=authorstyle259690]').text() || '';

            const Date = $(item).find('span[class=timestyle259713]').text();
            const pubDate = parseDate(Date, 'YYYY/MM/DD ');

            const result = {
                title,
                description,
                pubDate: timezone(pubDate, +8),
                link,
                author: '供稿单位：' + author,
            };
            //                                                 cache expiretime 120mins
            ctx.cache.set(link, JSON.stringify(result), config.cache.contentExpire * 24);
            return result;
        })
        .get();

    return resultItems;
}

function zsjycParse(ctx, $) {
    const data = $('a[class=c127701]').parent().parent().slice(0, Limit);
    const resultItems = data
        .map(async (_, item) => {
            const title = $(item).find('a[class=c127701]').attr('title');
            const href = $(item).find('a[class=c127701]').attr('href');
            const link = typeMap.zsjyc[1] + href;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return JSON.parse(cache);
            }

            let description = '';
            let articleData = '';
            // for some unexpected href link
            try {
                const articleRes = await got.get(link);
                articleData = cheerio.load(articleRes.data);
                const articleBody = articleData('div[class=v_news_content]').html().slice(1);
                description = art(path.join(__dirname, 'templates/hafu.art'), articleBody)();
            } catch {
                description = href;
            }

            const Date = $(item).find('span[class=timestyle127701]').text();
            const pubDate = parseDate(Date, 'YYYY-MM-DD ');

            const result = {
                title,
                description,
                pubDate: timezone(pubDate, +8),
                link,
                author: '供稿单位：招生就业处',
            };
            //                                                 cache expiretime 120mins
            ctx.cache.set(link, JSON.stringify(result), config.cache.contentExpire * 24);
            return result;
        })
        .get();

    return resultItems;
}
