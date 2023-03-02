const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const CryptoJS = require('crypto-js');

const accountApi = 'https://account-api.huxiu.com';
const articleApi = 'https://api-article.huxiu.com';
const baseUrl = 'https://www.huxiu.com';
const briefApi = 'https://api-brief.huxiu.com';
const momentApi = 'https://moment-api.huxiu.com';
const searchApi = 'https://search-api.huxiu.com';

const ProcessFeed = (list, cache) =>
    Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link, {
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const $ = cheerio.load(response.data);
                const initialState = parseInitialState($);

                if (item.link.startsWith(`${baseUrl}/article/`)) {
                    fetchArticle(initialState, item);
                } else if (item.link.startsWith(`${baseUrl}/brief/`)) {
                    fetchBrief(initialState, item);
                }

                return item;
            })
        )
    );

const fetchArticle = (initialState, item) => {
    const { articleDetail } = initialState.articleDetail;
    const topImg = art(path.join(__dirname, 'templates/img.art'), {
        img: articleDetail.pic_path.split('?')[0],
    });
    let video = '';
    if (articleDetail.video_info) {
        video = art(path.join(__dirname, 'templates/video.art'), {
            video_info: articleDetail.video_info,
        });
    }

    const $ = cheerio.load(articleDetail.content, null, false);

    $('.text-big-title').each((_, e) => (e.tagName = 'h3'));
    fixImg($);
    removeExtraLinebreak($);
    // $('img.dialog_add_wxxy_qrcode_icon').remove();

    item.description = video + topImg + $.html();
    item.author = articleDetail.author;
    item.category = articleDetail.tags_info.map((tag) => tag.name);
};

const fetchBrief = (initialState, item) => {
    const { brief_detail } = initialState.briefStoreModule;
    const { brief_column } = brief_detail;

    const description = art(path.join(__dirname, 'templates/brief.art'), {
        brief: brief_detail.brief,
    });

    const $ = cheerio.load(description, null, false);

    $('button.black-dot').remove();
    fixImg($);
    removeExtraLinebreak($);

    item.description = $.html();
    item.author = brief_detail.brief.publisher_list.map((item) => item.username).join(', ');
    item.pubDate = parseDate(brief_column.update_time, 'X');
};

const parseInitialState = ($) =>
    JSON.parse(
        $('script')
            .text()
            .match(/window\.__INITIAL_STATE__=(\{.*?\});\(function\(\)/)[1]
    );

const fixImg = ($) => {
    $('img.lazyImg, img.js-preview').each((_, e) => {
        if (e.attribs._src) {
            e.attribs.src = e.attribs._src.split('?')[0];
            delete e.attribs._src;
        }
        if (e.attribs.src.includes('?')) {
            e.attribs.src = e.attribs.src.split('?')[0];
        }
        if (e.attribs['data-w']) {
            e.attribs.width = e.attribs['data-w'];
            delete e.attribs['data-w'];
        }
        if (e.attribs['data-h']) {
            e.attribs.height = e.attribs['data-h'];
            delete e.attribs['data-h'];
        }
    });
};

const removeExtraLinebreak = ($) => {
    $('p').each((_, e) => {
        e = $(e);
        if (e.find('img').length === 0 && e.text().match(/^\s*$/)) {
            e.remove();
        }
    });
};

const generateNonce = () => {
    let nonce = '';
    const e = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const t = 16;
    for (let i = 0; i < t; i++) {
        nonce += e.charAt(Math.floor(Math.random() * e.length));
    }
    return nonce;
};

const generateSignature = () => {
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    // const appSecret = '4nHzGgGt7WX4zFTsTKocpxg4dzU6-wUi';
    const appSecret = 'hUzaVKtNfDE-6UiyaJdfsmjW-8dwoyVc'; // appid: 'hx_search'
    const nonce = generateNonce();
    const r = [appSecret, timestamp, nonce].sort();
    return {
        nonce,
        timestamp,
        signature: CryptoJS.SHA1(r[0] + r[1] + r[2]).toString(),
    };
};

module.exports = {
    accountApi,
    articleApi,
    baseUrl,
    briefApi,
    momentApi,
    searchApi,
    ProcessFeed,
    fetchArticle,
    fetchBrief,
    parseInitialState,
    fixImg,
    removeExtraLinebreak,
    generateSignature,
};
