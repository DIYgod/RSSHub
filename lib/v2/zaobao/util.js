const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

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
    let data = $('.article-list').find('.article-type');
    if (data.length === 0) {
        // for HK version
        data = $('.clearfix').find('.list-block');
    }

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
            // addBack: for HK version
            let link = $item.find('a').addBack('a')[0].attribs.href;

            let resultItem = {};

            if (link[0] !== '/') {
                // https://www.zaobao.com/interactive-graphics
                const title = $item.find('a').text();
                let dateNodes = $item.find('.meta-published-date');
                if (dateNodes.length === 0) {
                    dateNodes = $item.find('.datestamp');
                }
                let dateString;
                let pubDate = undefined;
                if (dateNodes.length !== 0) {
                    dateString = dateNodes.text().trim();
                    const dateParts = dateString.split('/');
                    dateParts.reverse();
                    dateString = dateParts.join('-');
                    pubDate = date(dateString);
                    // if conversion was no success, pubDate === dateString
                    // zaobao seems always UTC+8
                    pubDate = pubDate === dateString ? undefined : timezone(pubDate, +8);
                }

                resultItem = {
                    title,
                    description: title,
                    pubDate,
                    link,
                };
                return Promise.resolve(resultItem);
            } else {
                link = baseUrl + link;
            }

            const value = await ctx.cache.get(link);

            if (value) {
                resultItem = JSON.parse(value);
            } else {
                const article = await got_ins.get(link);
                const $1 = cheerio.load(article.data);

                let time = $1('.date-published', '.content').slice(0, 1).text().trim();
                if (!time) {
                    // for HK version
                    time = $1('.author-info').find('.mgt10').slice(0, 1).text().trim();
                }
                time = time.replace('年', '-').replace('月', '-').replace('日', '').replace('发布 /', '');

                $1('.overlay-microtransaction').remove();
                $1('#video-freemium-player').remove();
                $1('script').remove();

                let articleBodyNode = $1('.article-content-rawhtml');
                if (articleBodyNode.length === 0) {
                    // for HK version
                    articleBodyNode = $1('.article-body');
                }

                const articleBody = articleBodyNode.html();

                const imageDataArray = [];
                if ($1('.inline-figure-img').length) {
                    // for SG version
                    imageDataArray.push({
                        type: 'normalHTML',
                        html: $1('.inline-figure-img')
                            .html()
                            .replace(/\/\/.*\.com\/s3fs-public/, '//static.zaobao.com/s3fs-public')
                            .replace(/s3\/files/, 's3fs-public'),
                    });
                }
                if ($1('.body-content .loadme picture img').length) {
                    // Unused?
                    imageDataArray.push({
                        type: 'data',
                        src: $1('.body-content .loadme picture source')
                            .attr('data-srcset')
                            .replace(/\/\/.*\.com\/s3fs-public/, '//static.zaobao.com/s3fs-public')
                            .replace(/s3\/files/, 's3fs-public'),
                        title: $1('.body-content .loadme picture img').attr('title'),
                    });
                }
                if ($1('.inline-figure-gallery').length) {
                    // Unused?
                    imageDataArray.push({
                        type: 'normalHTML',
                        html: $1('.inline-figure-gallery')
                            .html()
                            .replace(/\/\/.*\.com\/s3fs-public/, '//static.zaobao.com/s3fs-public')
                            .replace(/s3\/files/, 's3fs-public'),
                    });
                }
                if ($1('#carousel-article').length) {
                    // for HK version
                    imageDataArray.push({
                        type: 'normalHTML',
                        html: $1('#carousel-article .carousel-inner')
                            .html()
                            .replace(/\/\/.*\.com\/s3fs-public/, '//static.zaobao.com/s3fs-public')
                            .replace(/s3\/files/, 's3fs-public'),
                    });
                }

                resultItem = {
                    // <- for SG version  -> for HK version
                    title: $1('h1', '.content').text().trim() || $1('h1.article-title').text(),
                    description: art(path.join(__dirname, 'templates/zaobao.art'), {
                        articleBody,
                        imageDataArray,
                    }),
                    pubDate: timezone(time, +8), // zaobao seems always UTC+8
                    link,
                };
                ctx.cache.set(link, JSON.stringify(resultItem));
            }

            return Promise.resolve(resultItem);
        })
    );
    return {
        title,
        resultList,
    };
};
module.exports = {
    parseList,
};
