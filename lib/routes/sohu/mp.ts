import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';
import { art } from '@/utils/render';
import CryptoJS from 'crypto-js';

export const route: Route = {
    path: '/mp/:xpt',
    categories: ['new-media'],
    example: '/sohu/mp/c29odXptdGhnbjZ3NEBzb2h1LmNvbQ==',
    parameters: { xpt: '搜狐号 xpt ，可在URL中找到或搜狐号 ID' },
    radar: [
        {
            source: ['mp.sohu.com/profile'],
            target: (_params, url) => `/sohu/mp/${new URL(url).searchParams.get('xpt')}`,
        },
    ],
    name: '最新',
    maintainers: ['HenryQW'],
    handler,
    description: `搜狐号 ID 可以通过以下方式获取：
  1.  通过浏览器搜索相关搜狐号 \`果壳 site: mp.sohu.com\`。
  2.  通过浏览器控制台执行 \`window.globalConst.mkeyConst_mkey\`，返回的即为搜狐号 ID。`,
};

function randomString(length = 32) {
    let r = '';
    const e = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    const n = e.length;
    for (let i = 0; i < length; i++) {
        r += e.charAt(Math.floor(Math.random() * n));
    }
    return r;
}
const defaultSUV = '1612268936507kas0gk';

function decryptImageUrl(cipherText) {
    const key = CryptoJS.enc.Utf8.parse('www.sohu.com6666');
    const cipher = CryptoJS.AES.decrypt(cipherText, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return cipher.toString(CryptoJS.enc.Utf8);
}

function fetchArticle(item) {
    return cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = cheerio.load(response);

        $('.original-title, .lookall-box').remove();
        item.author = item.author || $('span[data-role="original-link"] a').text();

        if (/window\.sohu_mp\.article_video/.test($('script').text())) {
            const videoSrc = $('script')
                .text()
                .match(/\s*url: "(.*?)",/)?.[1];
            item.description = art(path.join(__dirname, 'templates/video.art'), {
                poster: $('script')
                    .text()
                    .match(/cover: "(.*?)",/)?.[1],
                src: videoSrc,
                type: videoSrc?.split('.').pop()?.toLowerCase(),
            });
        } else {
            const article = $('#mp-editor');

            article.find('#backsohucom, p[data-role="editor-name"]').each((i, e) => {
                $(e).remove();
            });
            article.find('img').each((_, e) => {
                const $e = $(e);
                if ($e.attr('data-src') && !$e.attr('src')) {
                    $e.attr('src', decryptImageUrl($e.attr('data-src')));
                    $e.removeAttr('data-src');
                }
            });

            item.description = article.html();
        }

        return item;
    });
}

async function handler(ctx) {
    const xpt = ctx.req.param('xpt');
    const isPureNumber = /^\d+$/.test(xpt);
    if (isPureNumber) {
        return legacyIdHandler(ctx);
    }

    const pageResponse = await ofetch.raw('https://mp.sohu.com/profile', {
        query: {
            xpt,
        },
    });
    const suv = pageResponse.headers
        ?.getSetCookie()
        .find((e) => e.startsWith('SUV'))
        ?.split(';')[0];
    const $ = cheerio.load(pageResponse._data);

    const CBDRenderConst = JSON.parse(
        $('script:contains("CBDRenderConst")')
            .text()
            .trim()
            .match(/CBDRenderConst\s=\s(.*)/)?.[1] || '{}'
    );
    const contentData = JSON.parse(
        $('script:contains("contentData")')
            .toArray()
            .map(
                (e) =>
                    $(e)
                        .text()
                        .match(/contentData = (.*)/)?.[1]
            )
            .sort((a: any, b: any) => b.length - a.length)[0] || '{}'
    );
    const blockRenderData = JSON.parse(
        $('script:contains("column_2_text")')
            .text()
            .match(/({.*})/)?.[1]
    );
    const renderData = blockRenderData[Object.keys(blockRenderData).find((e) => e.startsWith('FeedSlideloadAuthor'))];
    const globalConst = JSON.parse(
        $('script:contains("globalConst")')
            .text()
            .match(/globalConst\s=\s(.*)/)?.[1] || '{}'
    );
    const originalRequest = JSON.parse(
        $('script:contains("originalRequest")')
            .text()
            .match(/originalRequest\s=\s(.*)/)?.[1] || '{}'
    );

    const blockData = await ofetch('https://odin.sohu.com/odin/api/blockdata', {
        method: 'POST',
        headers: {
            Cookie: Object.entries({
                SUV: suv,
                itssohu: 'true',
                reqtype: 'pc',
                t: Date.now(),
            })
                .map(([key, value]) => `${key}=${value}`)
                .join('; '),
        },
        body: {
            pvId: CBDRenderConst.COMMONCONFIG.pvId || `${Date.now()}_${randomString(7)}`,
            pageId: `${Date.now()}_${defaultSUV.slice(0, -5)}_${randomString(3)}`,
            mainContent: {
                productType: contentData.businessType || '13',
                productId: contentData.id || '324',
                secureScore: contentData.secureScore || '5',
                categoryId: contentData.categoryId || '47',
                adTags: contentData.adTags || '11111111',
                authorId: contentData.account.id || 121_135_924,
            },
            resourceList: [
                {
                    tplCompKey: renderData.param.data2.reqParam.tplCompKey || 'FeedSlideloadAuthor_2_0_pc_1655965929143_data2',
                    isServerRender: renderData.param.data2.reqParam.isServerRender || false,
                    isSingleAd: renderData.param.data2.reqParam.isSingleAd || false,
                    configSource: renderData.param.data2.reqParam.configSource || 'mp',
                    content: {
                        productId: renderData.param.data2.reqParam.content.productId || '325',
                        productType: renderData.param.data2.reqParam.content.productType || '13',
                        size: 20,
                        pro: renderData.param.pro || '0,1,3,4,5',
                        feedType: renderData.param.feedType || 'XTOPIC_SYNTHETICAL',
                        view: '',
                        innerTag: renderData.param.data2.reqParam.content.innerTag || 'work',
                        spm: renderData.param.data2.reqParam.content.spm || 'smpc.channel_248.block3_308_hHsK47_2_fd',
                        page: 1,
                        requestId: `${Date.now()}_${randomString(13)}_${contentData.id}`,
                    },
                    adInfo: {},
                    context: {
                        mkey: globalConst.mkeyConst_mkey, // legacy ID
                    },
                },
            ],
        },
    });

    const list = blockData.data[renderData.param.data2.reqParam.tplCompKey].list.map((item) => ({
        title: item.title,
        description: item.brief,
        link: `https://www.sohu.com/a/${item.id}_${item.authorId}`,
        author: item.authorName,
        pubDate: parseDate(item.postTime, 'x'),
    }));

    const items = await Promise.all(list.map((e) => fetchArticle(e)));

    return {
        title: `搜狐号 - ${globalConst.title}`,
        link: originalRequest.url,
        item: items,
    };
}

async function legacyIdHandler(ctx) {
    const id = ctx.req.param('xpt');
    const authorArticleAPI = `https://v2.sohu.com/author-page-api/author-articles/pc/${id}`;

    const response = await ofetch(authorArticleAPI);
    const list = response.data.pcArticleVOS.map((item) => ({
        title: item.title,
        link: item.link.startsWith('http') ? item.link : `https://${item.link}`,
        pubDate: parseDate(item.publicTime),
    }));

    const items = await Promise.all(list.map((e) => fetchArticle(e)));

    return {
        title: `搜狐号 - ${id}`,
        item: items,
    };
}
