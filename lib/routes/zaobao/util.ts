import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';
import path from 'node:path';
import { base32 } from 'rfc4648';

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
 * @returns 新闻标题以及新闻列表
 */
const parseList = async (
    ctx,
    sectionUrl: string
): Promise<{
    title: string;
    resultList: {
        title: string;
        description: string;
        pubDate: string;
        link: string;
    }[];
}> => {
    const response = await got_ins.get(baseUrl + sectionUrl);
    const $ = load(response.data);
    let data = /realtime/.test(sectionUrl) ? $('.on-listing-pages') : $('.article-list').find('.article-type');
    if (data.length === 0) {
        // for HK version
        data = $('.clearfix').find('.list-block');
    }

    const title = $('meta[property="og:title"]').attr('content');

    const resultList = await Promise.all(
        data.toArray().map((item) => {
            const $item = $(item);
            // addBack: for HK version
            let link = $item.find('a').addBack('a')[0].attribs.href;

            if (link[0] !== '/') {
                // https://www.zaobao.com/interactive-graphics
                const title = $item.find('a').text();
                let dateNodes = $item.find('.meta-published-date');
                if (dateNodes.length === 0) {
                    dateNodes = $item.find('.datestamp');
                }
                let dateString;
                let pubDate;
                if (dateNodes.length !== 0) {
                    dateString = dateNodes.text().trim();
                    const dateParts = dateString.split('/');
                    dateParts.reverse();
                    dateString = dateParts.join('-');
                    pubDate = parseRelativeDate(dateString);
                    // if conversion was no success, pubDate === dateString
                    // zaobao seems always UTC+8
                    pubDate = pubDate === dateString ? undefined : timezone(pubDate, +8);
                }

                return {
                    title,
                    description: title,
                    pubDate,
                    link,
                };
            }

            link = baseUrl + link;

            return cache.tryGet(link, async () => {
                const article = await got_ins.get(link);
                const $1 = load(article.data);

                const time = (() =>
                    $1("head script[type='application/json']").text() === ''
                        ? new Date(JSON.parse($1("head script[type='application/ld+json']").eq(1).text())?.datePublished) // HK
                        : new Date(Number(JSON.parse($1("head script[type='application/json']").text())?.articleDetails?.created) * 1000))(); // SG

                $1('.overlay-microtransaction').remove();
                $1('#video-freemium-player').remove();
                $1('script').remove();

                let articleBodyNode = $1('.article-content-rawhtml');
                if (articleBodyNode.length === 0) {
                    // for HK version
                    orderContent($1('.article-body'));
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
                    // for SG version
                    imageDataArray.push({
                        type: 'normalHTML',
                        html: $1('.inline-figure-gallery')
                            .html()
                            .replaceAll(/\/\/.*\.com\/s3fs-public/g, '//static.zaobao.com/s3fs-public')
                            .replaceAll('s3/files', 's3fs-public'),
                    });
                }
                if ($1('#carousel-article').length) {
                    // for HK version, HK version of multi images use same selector as single image, so g is needed for all pages
                    imageDataArray.push({
                        type: 'normalHTML',
                        html: $1('#carousel-article .carousel-inner')
                            .html()
                            .replaceAll(/\/\/.*\.com\/s3fs-public/g, '//static.zaobao.com/s3fs-public')
                            .replaceAll('s3/files', 's3fs-public'),
                    });
                }

                return {
                    // <- for SG version  -> for HK version
                    title: $1('h1', '.content').text().trim() || $1('h1.article-title').text(),
                    description: art(path.join(__dirname, 'templates/zaobao.art'), {
                        articleBody,
                        imageDataArray,
                    }),
                    pubDate: time,
                    link,
                };
            });
        })
    );
    return {
        title,
        resultList,
    };
};

const orderContent = (parent) => {
    for (const [i, e] of parent
        .children()
        .toArray()
        .sort((a, b) => {
            const index = Buffer.from(base32.parse('GM======')).toString(); // substring(3)
            a = Buffer.from(base32.parse(parent.find(a).data('s').substring(index))).toString();
            b = Buffer.from(base32.parse(parent.find(b).data('s').substring(index))).toString();
            return a - b;
        })
        .entries()) {
        parent.find(e).attr('s', i);
        parent.append(e);
    }
};

export { parseList, orderContent };
