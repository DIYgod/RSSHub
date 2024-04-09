const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

const typeMap = {
    ggtz: { url: 'https://www.hafu.edu.cn/index/ggtz.htm', root: 'https://www.hafu.edu.cn/', title: '河南财院 - 公告通知', parseFn: ggtzParse },
    jwc: { url: 'https://jwc.hafu.edu.cn/tzgg.htm', root: 'https://jwc.hafu.edu.cn/', title: '河南财院 教务处 - 公告通知', parseFn: jwcParse },
    zsjyc: { url: 'https://zsjyc.hafu.edu.cn/tztg.htm', root: 'https://zsjyc.hafu.edu.cn/', title: '河南财院 招生就业处 - 公告通知', parseFn: zsjycParse },
};
// Number of get articles
let limit = 10;

module.exports = async (ctx, type) => {
    const link = typeMap[type].url;
    const title = typeMap[type].title;

    const response = await got(link);
    const $ = cheerio.load(response.data);

    limit = ctx.query.limit || limit;
    const resultList = await typeMap[type].parseFn(ctx, $);

    return {
        title,
        link,
        resultList,
    };
};

async function tryGetFullText(href, link, type) {
    let articleData = '';
    let description = '';
    // for some unexpected href link
    try {
        const articleRes = await got(link);
        articleData = cheerio.load(articleRes.data);
        // fullText
        let articleBody = articleData('div[class=v_news_content]').html();
        // attachments
        if (articleData('[id^=nattach]').length !== 0) {
            articleBody = tryGetAttachments(articleData, articleBody, type);
        }

        description = art(path.join(__dirname, 'templates/hafu.art'), articleBody)();
    } catch {
        description = href;
    }

    return { articleData, description };
}

function tryGetAttachments(articleData, articleBody, type) {
    if (type === 'ggtz') {
        articleData(`[id^=nattach]`)
            .prev()
            .map((_, item) => {
                const href = articleData(item).attr('href').slice(1);
                const link = typeMap.ggtz.root + href;
                const title = articleData(item).text();
                articleBody += '<br/>';
                articleBody += `<a href=${link}>${title}</a>`;
                return null;
            });
    } else {
        articleData('[id^=nattach]')
            .parent()
            .prev()
            .map((_, item) => {
                const href = articleData(item).find('a').attr('href').slice(1);
                const link = typeMap[type].root + href;
                const title = articleData(item).find('a').find('span').text();
                articleBody += '<br/>';
                articleBody += `<a href=${link}> ${title} </a>`;
                return null;
            });
    }

    return articleBody;
}
// A. got from hostPage     1.article(link), 2.article(title), 3.(pubDate)
// B. got from articlePage  1.description(fullText), 2.article(author), 3.detailed(pubDate)
async function ggtzParse(ctx, $) {
    const data = $('a[class=c269582]').parent().slice(0, limit);
    const resultItems = await Promise.all(
        data
            .map(async (_, item) => {
                // .slice(3) for cut out str '../' in original link
                const href = $(item).find('a[class=c269582]').attr('href').slice(3);
                const link = typeMap.ggtz.root + href;
                const title = $(item).find('a[class=c269582]').attr('title');

                const result = await ctx.cache.tryGet(link, async () => {
                    const { articleData, description } = await tryGetFullText(href, link, 'ggtz');
                    let author = '';
                    let pubDate = '';
                    if (articleData instanceof Function) {
                        const header = articleData('h1').next().text();
                        const index = header.indexOf('日期');

                        author = header.substring(0, index - 2) || '';

                        const date = header.substring(index + 3, index + 19);
                        pubDate = parseDate(date, 'YYYY-MM-DD HH:mm');
                    } else {
                        const date = $(item).find('a[class=c269582_date]').text();
                        pubDate = parseDate(date, 'YYYY-MM-DD');
                    }

                    return {
                        title,
                        description,
                        pubDate: timezone(pubDate, +8),
                        link,
                        author,
                    };
                });

                return result;
            })
            .get()
    );

    return resultItems;
}
// A. got from hostPage     1.article(link), 2.article(title), 3.(pubDate)
// B. got from articlePage  1.description(fullText), 2.article(author)
async function jwcParse(ctx, $) {
    const data = $('a[class=c259713]').parent().parent().slice(0, limit);
    const resultItems = await Promise.all(
        data
            .map(async (_, item) => {
                const href = $(item).find('a[class=c259713]').attr('href');
                const link = typeMap.jwc.root + href;
                const title = $(item).find('a[class=c259713]').attr('title');

                const date = $(item).find('span[class=timestyle259713]').text();
                const pubDate = parseDate(date, 'YYYY/MM/DD');

                const result = await ctx.cache.tryGet(link, async () => {
                    const { articleData, description } = await tryGetFullText(href, link, 'jwc');

                    let author = '';
                    if (articleData instanceof Function) {
                        author = articleData('span[class=authorstyle259690]').text();
                    }

                    return {
                        title,
                        description,
                        pubDate: timezone(pubDate, +8),
                        link,
                        author: '供稿单位：' + author,
                    };
                });

                return result;
            })
            .get()
    );

    return resultItems;
}
// A. got from hostPage     1.article(link), 2.article(title), 3.(pubDate)
// B. got from articlePage  1.description(fullText), 2.detailed(pubDate)
async function zsjycParse(ctx, $) {
    const data = $('a[class=c127701]').parent().parent().slice(0, limit);
    const resultItems = await Promise.all(
        data
            .map(async (_, item) => {
                const href = $(item).find('a[class=c127701]').attr('href');
                const link = typeMap.zsjyc.root + href;

                const title = $(item).find('a[class=c127701]').attr('title');

                const result = await ctx.cache.tryGet(link, async () => {
                    const { articleData, description } = await tryGetFullText(href, link, 'zsjyc');

                    let pubDate = '';
                    if (articleData instanceof Function) {
                        const date = articleData('span[class=timestyle127702]').text();
                        pubDate = parseDate(date, 'YYYY-MM-DD HH:mm');
                    } else {
                        const date = $(item).find('a[class=c269582_date]').text();
                        pubDate = parseDate(date, 'YYYY-MM-DD');
                    }

                    return {
                        title,
                        description,
                        pubDate: timezone(pubDate, +8),
                        link,
                        author: '供稿单位：招生就业处',
                    };
                });

                return result;
            })
            .get()
    );

    return resultItems;
}
