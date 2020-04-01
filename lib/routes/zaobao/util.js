const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseUrl = 'https://www.zaobao.com';
const got_ins = got.extend({
    headers: {
        Referer: baseUrl,
    },
});

/**
 * 通用解析页面类似 https://www.zaobao.com/realtime/china 的网站
 *
 * @param {*} ctx RSSHub 的 ctx 参数，用来设置缓存
 * @param {string} sectionUrl 形如 /realtime/china 的字符串
 * @returns {Promise<{
 *  title: string;
 *  resultList: {
 *    title: string;
 *    description: string;
 *    pubDate: string;
 *    link: string;
 *  }[];}>} 新闻标题以及新闻列表
 */
const parseList = async (ctx, sectionUrl) => {
    const response = await got_ins.get(baseUrl + sectionUrl);
    const $ = cheerio.load(response.data);
    const data = $('.article-list').find('.article-type');

    const title = $('#breadcrumbs > a')
        .toArray()
        .reduce((acc, cV, cI) => {
            if (cI > 0) {
                return acc + '-' + $(cV).text();
            }
            return '';
        }, '');
    const resultList = await Promise.all(
        data.toArray().map(async (item) => {
            const $item = $(item);
            const link = baseUrl + $item.find('a')[0].attribs.href;

            let resultItem = {};

            const value = await ctx.cache.get(link);

            if (value) {
                resultItem = JSON.parse(value);
            } else {
                const article = await got_ins.get(link);
                const $1 = cheerio.load(article.data);

                const time = $1('.title-byline.date-published', '.content')
                    .slice(0, 1)
                    .text()
                    .replace('年', '-')
                    .replace('月', '-')
                    .replace('日', '')
                    .replace('发布 /', '');

                $1('.overlay-microtransaction').remove();
                $1('#video-freemium-player').remove();
                $1('script').remove();

                let description = $1('.article-content-rawhtml').html();
                if ($1('.inline-figure-img').length) {
                    description = $1('.inline-figure-img').html() + description;
                }
                if ($1('.inline-figure-gallery').length) {
                    description = $1('.inline-figure-gallery').html() + description;
                }

                resultItem = {
                    title: $1('h1', '.content').text(),
                    description: description,
                    pubDate: new Date(time).toUTCString(),
                    link: link,
                };
                ctx.cache.set(link, JSON.stringify(resultItem));
            }

            return Promise.resolve(resultItem);
        })
    );
    return {
        title: title,
        resultList: resultList,
    };
};
module.exports = {
    parseList,
};
