import querystring from 'node:querystring';

import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import logger from '@/utils/logger';
import { getPuppeteerPage } from '@/utils/puppeteer';
import { getCookies } from '@/utils/puppeteer-utils';
import { fallback, queryToBoolean, queryToInteger } from '@/utils/readable-social';

class RenewWeiboCookiesError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RenewWeiboCookiesError';
    }
}

const getDescriptionRenderParams = (routeParams, params = {}) => ({
    showEmojiInDescription: fallback(params.showEmojiInDescription, queryToInteger(routeParams.showEmojiInDescription), false),
    showLinkIconInDescription: fallback(params.showLinkIconInDescription, queryToInteger(routeParams.showLinkIconInDescription), true),
});

const formatDescriptionText = (html, { showEmojiInDescription, showLinkIconInDescription }) => {
    let formattedHtml = html;

    if (!showEmojiInDescription) {
        formattedHtml = formattedHtml.replaceAll(/<span class=["']?url-icon["']?><img\s[^>]*?alt=["']?([^>]+?)["']?\s[^>]*?\/><\/span>/g, '$1');
    }

    if (!showLinkIconInDescription) {
        formattedHtml = formattedHtml.replaceAll(/(<a\s[^>]*>)<span class=["']?url-icon["']?><img\s[^>]*><\/span>[^<>]*?<span class=["']?surl-text["']?>([^<>]*?)<\/span><\/a>/g, '$1$2</a>');
    }

    return formattedHtml;
};

const weiboUtils = {
    apiHeaders: {
        'MWeibo-Pwa': 1,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
    },
    RenewWeiboCookiesError,
    getCookies: (() => {
        const url = 'https://m.weibo.cn/';
        const coolingDownMessage = `Cooling down before new visitor Cookies from ${url} may be fetched`;
        let coolingDown = false;

        return async (renew: any = false) => {
            if (config.weibo.cookies) {
                if (renew) {
                    throw new Error('Cookies expired. Please update WEIBO_COOKIES');
                }
                return config.weibo.cookies;
            }

            const cacheKey = 'weibo:visitor-cookies';
            if (renew) {
                cache.set(cacheKey, '', 1);
            }
            return await cache.tryGet(cacheKey, async () => {
                if (coolingDown) {
                    if (renew?.message) {
                        logger.warn(coolingDownMessage);
                        throw renew;
                    } else {
                        throw new Error(coolingDownMessage);
                    }
                }
                coolingDown = true;
                setTimeout(() => {
                    coolingDown = false;
                }, config.cache.routeExpire * 1000);

                if (renew) {
                    logger.warn(`Renewing visitor Cookies from ${url}`);
                } else {
                    logger.info(`Fetching visitor Cookies from ${url}`);
                }
                let times = 0;
                const { page, destroy } = await getPuppeteerPage(url, {
                    onBeforeLoad: async (page) => {
                        const expectResourceTypes = new Set(['document', 'script', 'xhr', 'fetch']);
                        await page.setUserAgent(weiboUtils.apiHeaders['User-Agent']);
                        await page.setRequestInterception(true);
                        page.on('request', (request) => {
                            // 1st: initial request, 302 to visitor.passport.weibo.cn; 2nd: auth ok
                            if (!expectResourceTypes.has(request.resourceType()) || times >= 2) {
                                request.abort();
                                return;
                            }
                            if (request.url().startsWith(url)) {
                                times++;
                            }
                            request.continue();
                        });
                    },
                    // networkidle2 returns too early if the connection is slow
                    gotoConfig: { waitUntil: 'networkidle0' },
                });
                const cookies: string = await getCookies(page, 'weibo.cn');
                await destroy();
                if (times < 2 || !cookies) {
                    throw new Error(`Unable to fetch visitor cookies. Please set WEIBO_COOKIES. Redirection: ${times}, last URL: ${page.url()}`);
                }
                return cookies;
            });
        };
    })(),
    tryWithCookies: (() => {
        let errors = 0;
        const verifier = (resp: any): void => {
            if (resp?.data?.ok === -100) {
                throw new RenewWeiboCookiesError(`Cookies expired. Msg: ${resp?.data?.msg || ''} ${resp?.data?.url || ''}`);
            }
        };
        return async <T>(callback: (cookies: string, verifier: (resp: any) => void) => Promise<T>): Promise<T> => {
            try {
                return await callback(await weiboUtils.getCookies(false), verifier);
            } catch (error: any) {
                if (error.message?.includes('WEIBO_COOKIES')) {
                    throw error;
                }
                if (errors > 10) {
                    logger.warn(`Too many errors while fetching data from weibo API, renewing Cookies: ${error.message}`);
                    logger.info('Please open an issue on GitHub if renewing Cookies fixes the error');
                } else if ((error.name === 'HTTPError' || error.name === 'FetchError') && error.status === 432) {
                    // empty
                } else if (error.name === 'RenewWeiboCookiesError') {
                    // empty
                } else {
                    errors++;
                    throw error;
                }
                errors = 0;
                return await callback(await weiboUtils.getCookies(error), verifier);
            }
        };
    })(),
    formatTitle: (html) =>
        html
            .replaceAll(/<span class=["']url-icon["']><img\s[^>]*?alt=["']?([^>]+?)["']?\s[^>]*?\/?><\/span>/g, '$1') // 表情转换
            .replaceAll(/<span class=["']url-icon["']>(<img\s[^>]*>)<\/span>/g, '') // 去掉所有图标
            .replaceAll(/<img\s[^<]*>/g, '[图片]')
            // impossible to have inline script in weibo posts, but CodeQL complains about it
            // Dismiss it through the UI: https://github.com/github/codeql/issues/11427
            .replaceAll(/<[^<]*>/g, '')
            .replaceAll('\n', ' ')
            .trim(),
    formatExtended: (ctx, status, uid, params = {}, picsPrefixes = []) => {
        // `uid = undefined` to explicitly mark it as optional, avoiding IDEs prompting warnings

        // undefined and strings like "1" is also safely parsed, so no if branch is needed
        const routeParams = querystring.parse(ctx.req.param('routeParams'));
        const descriptionRenderParams = getDescriptionRenderParams(routeParams, params);

        const mergedParams = {
            readable: fallback(params.readable, queryToBoolean(routeParams.readable), false),
            authorNameBold: fallback(params.authorNameBold, queryToBoolean(routeParams.authorNameBold), false),
            showAuthorInTitle: fallback(params.showAuthorInTitle, queryToBoolean(routeParams.showAuthorInTitle), false),
            showAuthorInDesc: fallback(params.showAuthorInDesc, queryToBoolean(routeParams.showAuthorInDesc), false),
            showAuthorAvatarInDesc: fallback(params.showAuthorAvatarInDesc, queryToBoolean(routeParams.showAuthorAvatarInDesc), false),
            showAtBeforeAuthor: fallback(params.showAtBeforeAuthor, null, false),
            showEmojiForRetweet: fallback(params.showEmojiForRetweet, queryToBoolean(routeParams.showEmojiForRetweet), false),
            showRetweetTextInTitle: fallback(params.showRetweetTextInTitle, queryToBoolean(routeParams.showRetweetTextInTitle), true),
            addLinkForPics: fallback(params.addLinkForPics, queryToBoolean(routeParams.addLinkForPics), false),
            showTimestampInDescription: fallback(params.showTimestampInDescription, queryToBoolean(routeParams.showTimestampInDescription), false),

            widthOfPics: fallback(params.widthOfPics, queryToInteger(routeParams.widthOfPics), -1),
            heightOfPics: fallback(params.heightOfPics, queryToInteger(routeParams.heightOfPics), -1),
            sizeOfAuthorAvatar: fallback(params.sizeOfAuthorAvatar, queryToInteger(routeParams.sizeOfAuthorAvatar), 48),
            showEmojiInDescription: descriptionRenderParams.showEmojiInDescription,
            showLinkIconInDescription: descriptionRenderParams.showLinkIconInDescription,
            preferMobileLink: fallback(params.preferMobileLink, queryToBoolean(routeParams.preferMobileLink), false),
        };

        params = mergedParams;

        const {
            readable,
            authorNameBold,
            showAuthorInTitle,
            showAuthorInDesc,
            showAuthorAvatarInDesc,
            showAtBeforeAuthor,
            showEmojiForRetweet,
            showRetweetTextInTitle,
            addLinkForPics,
            showTimestampInDescription,

            widthOfPics,
            heightOfPics,
            sizeOfAuthorAvatar,
            preferMobileLink,
        } = params;

        let retweeted = '';
        // 长文章的处理
        let htmlNewLineUnreplaced = (status.longText && status.longText.longTextContent) || status.text || '';
        htmlNewLineUnreplaced = formatDescriptionText(htmlNewLineUnreplaced, descriptionRenderParams);

        // 提取 话题作为 category
        const category: string[] = htmlNewLineUnreplaced.match(/<span class=["']?surl-text["']?>#([^<>]*?)#<\/span>/g)?.map((e) => e?.match(/#([^#]+)#/)?.[1]);

        // 去掉乱七八糟的图标  // 不需要，上述的替换应该已经把所有的图标都替换掉了，且这条 regex 会破坏上述替换不发生时的输出
        // htmlNewLineUnreplaced = htmlNewLineUnreplaced.replace(/<span class=["']?url-icon["']?>(<img\s[^>]*?>)<\/span>/g, '');
        // 将行内图标的高度设置为一行，改善阅读体验。但有些阅读器删除了 style 属性，无法生效  // 不需要，微博已经作此设置
        // htmlNewLineUnreplaced = htmlNewLineUnreplaced.replace(/(?<=<span class=["']?url-icon["']?>)<img/g, '<img style="height: 1em"');
        // 去掉全文
        htmlNewLineUnreplaced = htmlNewLineUnreplaced.replaceAll('全文<br>', '<br>');
        htmlNewLineUnreplaced = htmlNewLineUnreplaced.replaceAll(/<a href="(.*?)">全文<\/a>/g, '');

        // 处理外部链接
        htmlNewLineUnreplaced = htmlNewLineUnreplaced.replaceAll(/"https:\/\/weibo\.cn\/sinaurl.*?[&?]u=(http.*?)"/g, (match, p1) => `"${decodeURIComponent(p1)}"`);

        // 处理图片的链接
        htmlNewLineUnreplaced = htmlNewLineUnreplaced.replaceAll(/<a\s+href="https?:\/\/[^"]+\.(jpg|png|gif)"/g, (match) => `${match} data-rsshub-image="href"`);

        let html = htmlNewLineUnreplaced.replaceAll('\n', '<br>');

        // 添加用户名和头像
        if (showAuthorInDesc) {
            let usernameAndAvatar = `<a href="https://weibo.com/${status.user.id}" target="_blank">`;
            if (showAuthorAvatarInDesc) {
                usernameAndAvatar += `<img width="${sizeOfAuthorAvatar}" height="${sizeOfAuthorAvatar}" src="${status.user.profile_image_url}" ${readable ? 'hspace="8" vspace="8" align="left"' : ''} />`;
            }
            let name = status.user.screen_name;
            if (showAtBeforeAuthor) {
                name = '@' + name;
            }
            usernameAndAvatar += authorNameBold ? `<strong>${name}</strong></a>:&ensp;` : `${name}</a>:&ensp;`;
            html = usernameAndAvatar + html;
        }

        // status.pics can be either an array or an object:
        // array: [ object, object, ... ]
        // object: { '0': object, '1': object, ... }  // REALLY AMAZING data structure
        if (status.pics && !Array.isArray(status.pics) && typeof status.pics === 'object') {
            status.pics = Object.values(status.pics);
        }

        // 添加文章头图，此处不需要回落到被转发的微博，后续处理被转发的微博时，还会执行到这里
        if (status.page_info && status.page_info.type === 'article' && status.page_info.page_pic && status.page_info.page_pic.url) {
            // 如果以后后续流程会用到其他字段，记得修改这里
            const pagePic = {
                large: {
                    url: status.page_info.page_pic.url,
                },
            };
            // 文章微博一般不会有配图，但也有可能有：https://weibo.com/6882481489/Lh85BkS3m
            if (status.pics) {
                status.pics.push(pagePic);
            } else {
                status.pics = [pagePic];
            }
        }

        // drop live photo
        const livePhotoCount = status.pics ? status.pics.filter((pic) => pic.type === 'livephoto').length : 0;
        const pics = status.pics && status.pics.filter((pic) => pic.type !== 'livephoto');

        // 添加微博配图
        if (pics) {
            if (readable) {
                html += '<br clear="both" /><div style="clear: both"></div>';
            }

            // 一些RSS Reader会识别所有<img>标签作为内含图片显示，我们不想要头像也作为内含图片之一
            // 让所有配图在description的最前面再次出现一次，但宽高设为0
            let picsPrefix = '';
            for (const item of pics) {
                picsPrefix += `<img width="0" height="0" hidden="true" src="${item.large.url}">`;
            }
            picsPrefixes.push(picsPrefix);

            for (const item of pics) {
                if (addLinkForPics) {
                    html += '<a href="' + item.large.url + '">';
                }

                let style = '';
                html += '<img ';
                html += readable ? 'vspace="8" hspace="4"' : '';
                if (item.large) {
                    const { geo, url } = item.large;

                    if (geo?.width || widthOfPics >= 0) {
                        const width = geo?.width || widthOfPics;
                        html += ` width="${width}"`;
                        style += `width: ${width}px;`;
                    }

                    if (geo?.height || heightOfPics >= 0) {
                        const height = geo?.height || heightOfPics;
                        html += ` height="${height}"`;
                        style += `height: ${height}px;`;
                    }

                    html += ` style="${style}" src="${url}">`;
                }

                if (addLinkForPics) {
                    html += '</a>';
                }

                htmlNewLineUnreplaced += '<img src="" />';
            }
        }

        // 处理转发的微博
        if (status.retweeted_status) {
            html += readable
                ? `<br clear="both" /><div style="clear: both"></div><blockquote style="background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;">`
                : `<br><blockquote> - 转发 `;
            if (!status.retweeted_status.user) {
                // 当转发的微博被删除时user为null
                status.retweeted_status.user = {
                    profile_image_url: '',
                    screen_name: '[原微博不可访问]',
                    id: 'sorry',
                };
            }
            // 插入转发的微博
            const retweetedParams = Object.assign({}, params);
            retweetedParams.showAuthorInDesc = true;
            retweetedParams.showAuthorAvatarInDesc = false;
            retweetedParams.showAtBeforeAuthor = true;
            retweeted += weiboUtils.formatExtended(ctx, status.retweeted_status, undefined, retweetedParams, picsPrefixes).description;

            html += retweeted;

            if (readable) {
                html += `<br><small>原博：<a href="https://weibo.com/${status.retweeted_status.user.id}/${status.retweeted_status.bid}" target="_blank" rel="noopener noreferrer">https://weibo.com/${status.retweeted_status.user.id}/${status.retweeted_status.bid}</a></small>`;
            }
            if (showTimestampInDescription) {
                html += `<br><small>` + new Date(status.retweeted_status.created_at).toLocaleString() + `</small>`;
            }
            if (readable) {
                html += `<br clear="both" /><div style="clear: both"></div>`;
            }

            html += '</blockquote>';
        }

        if (showAuthorInDesc && showAuthorAvatarInDesc) {
            html = picsPrefixes.join('') + html;
        }

        let title = '';
        if (showAuthorInTitle) {
            title += status.user.screen_name + ': ';
        }
        if (!status.retweeted_status || showRetweetTextInTitle) {
            title += weiboUtils.formatTitle(htmlNewLineUnreplaced);
        }
        if (status.retweeted_status) {
            title += showEmojiForRetweet ? '🔁 ' : ' - 转发 ';
            title += weiboUtils.formatTitle(retweeted);
        }
        if (livePhotoCount > 0) {
            title += ' ';
            title += Array.from({ length: livePhotoCount + 1 }).join('[Live Photo]');
        }
        if (status.page_info && status.page_info === 'video') {
            title += ' [视频]';
        }

        uid = uid || status.user?.id;
        const bid = status.bid || status.id;
        const guid = uid ? `https://weibo.com/${uid}/${bid}` : `https://m.weibo.cn/status/${bid}`;
        const link = preferMobileLink ? `https://m.weibo.cn/status/${bid}` : guid;

        const author = [
            {
                name: status.user?.screen_name,
                url: `https://weibo.com/${uid}`,
                avatar: status.user?.avatar_hd,
            },
        ];
        const pubDate = status.created_at;

        return { description: html, title, link, guid, author, pubDate, category };
    },
    getShowData: async (uid, bid) => {
        const link = `https://m.weibo.cn/statuses/show?id=${bid}`;
        const itemResponse = await got.get(link, {
            headers: {
                Referer: `https://m.weibo.cn/u/${uid}`,
                ...weiboUtils.apiHeaders,
            },
        });
        return itemResponse.data.data;
    },
    formatVideo: (itemDesc, status) => {
        const pageInfo = status.page_info;
        const livePhotos = status.pics && status.pics.filter((pic) => pic.type === 'livephoto' && pic.videoSrc);
        let video = '<br clear="both" /><div style="clear: both"></div>';
        let anyVideo = false;
        if (livePhotos) {
            for (const livePhoto of livePhotos) {
                video += `<video controls="controls" poster="${(livePhoto.large && livePhoto.large.url) || livePhoto.url}" src="${livePhoto.videoSrc}" style="width: 100%"></video>`;
                anyVideo = true;
            }
        }
        if (pageInfo && pageInfo.type === 'video') {
            const pagePic = pageInfo.page_pic;
            const posterUrl = pagePic ? pagePic.url : '';
            const pageUrl = pageInfo.page_url; // video page url
            const mediaInfo = pageInfo.media_info || {}; // stream_url, stream_url_hd; deprecated: mp4_720p_mp4, mp4_hd_url, mp4_sd_url
            const urls = pageInfo.urls || {}; // mp4_720p_mp4, mp4_hd_mp4, hevc_mp4_hd, mp4_ld_mp4

            const video720p = urls.mp4_720p_mp4 || mediaInfo.mp4_720p_mp4 || '';
            const videoHd = urls.mp4_hd_mp4 || mediaInfo.mp4_hd_url || mediaInfo.stream_url_hd || '';
            const videoHdHevc = urls.hevc_mp4_hd || '';
            const videoLd = urls.mp4_ld_mp4 || mediaInfo.mp4_sd_url || mediaInfo.stream_url || '';

            const hasVideo = video720p || videoHd || videoHdHevc || videoLd;

            if (hasVideo) {
                video += `<video controls="controls" poster="${posterUrl}" style="width: 100%">`;
                if (video720p) {
                    video += `<source src="${video720p}">`;
                }
                if (videoHd) {
                    video += `<source src="${videoHd}">`;
                }
                if (videoHdHevc) {
                    video += `<source src="${videoHdHevc}">`;
                }
                if (videoLd) {
                    video += `<source src="${videoLd}">`;
                }
                if (pageUrl) {
                    video += `<p>视频无法显示，请前往<a href="${pageUrl}" target="_blank" rel="noopener noreferrer">微博视频</a>观看。</p>`;
                }
                video += '</video>';
                anyVideo = true;
            }
        }
        if (anyVideo) {
            itemDesc += video;
        }
        return itemDesc;
    },
    formatArticle: async (ctx, itemDesc, status) => {
        const pageInfo = status.page_info;
        if (pageInfo && pageInfo.type === 'article' && pageInfo.page_url) {
            const pageUrl = pageInfo.page_url;
            const articleIdMatch = pageUrl.match(/id=(\d+)/);
            if (!articleIdMatch) {
                return itemDesc;
            }
            const articleId = articleIdMatch[1];
            const link = `https://card.weibo.com/article/m/aj/detail?id=${articleId}`;
            const response = await cache.tryGet(link, async () => {
                const _response = await got.get(link, {
                    headers: {
                        Referer: `https://card.weibo.com/article/m/show/id/${articleId}`,
                        ...weiboUtils.apiHeaders,
                    },
                });
                return _response.data;
            }); // cache it!
            const article = response.data;
            if (article && article.title && article.content) {
                const title = article.title;
                const content = article.content;
                const summary = article.summary;
                const createAt = article.create_at;
                const readCount = article.read_count;
                const isOriginal = article.is_original;
                const isArticleNonFree = article.is_article_free; // 微博起错了字段名，它为 1 时才是收费文章

                // 许多微博文章都给文字设置了白色背景，这里也只好使用白色背景了
                let html = '<br clear="both" /><br clear="both" />';
                html += '<div style="clear: both"></div><div style="background: #fff;border:5px solid #80808030;margin:0;padding:3% 5%;overflow-wrap: break-word">';

                html += `<h1 style="font-size: 1.5rem;line-height: 1.25;color: #333;">${title}</h1>`; // 加入标题

                // 加入文章信息
                const iconStyle =
                    'display: inline-block;margin-inline: 0.25rem;width: 2.25rem; height: 1.125rem; background: #eee; border-radius: 2px; box-sizing: border-box; text-align: center; line-height: 1.0625rem; font-size: 0.75rem; color: #aaa;';
                let articleMeta = '<p style="line-height: 1.66; color: #999;margin: 0 0 0.75rem;font-size: 0.75rem;padding: 0">';
                if (isArticleNonFree) {
                    articleMeta += `<span style="${iconStyle}">试读</span> `;
                }
                if (isOriginal) {
                    articleMeta += `<span style="${iconStyle}">原创</span> `;
                }
                articleMeta += `<span style="margin-inline: 0.25rem;">发布时间: ${createAt}</span> `; // 发布时间
                articleMeta += `<span style="margin-inline: 0.25rem;">阅读量: ${readCount}</span> `; // 阅读量
                articleMeta += '</p>';
                html += articleMeta;

                if (summary) {
                    html += `<p style="color: #999;line-height: 1.5rem;padding: 0.0625rem 0 0.875rem;margin: 0">${summary}</p>`; // 摘要
                }

                html += '<div style="height: 0;border-bottom: 1px dashed #999;margin-bottom: 0.75rem;"></div>'; // 分割线

                // 正文处理，加入一些在微博文章页的 CSS 中定义的不可或缺的样式
                const $ = load(content);
                $('p').each((_, elem) => {
                    elem = $(elem);
                    let style = elem.attr('style') || '';
                    style = 'margin: 0;padding: 0;border: 0;' + style;
                    elem.attr('style', style);
                });
                $('.image').each((_, elem) => {
                    elem = $(elem);
                    let style = elem.attr('style') || '';
                    style = 'display: table;text-align: center;margin-left: auto;margin-right: auto;clear: both;min-width: 50px;' + style;
                    elem.attr('style', style);
                });
                $('img').each((_, elem) => {
                    elem = $(elem);
                    let style = elem.attr('style') || '';
                    style = 'display: block;max-width: 100%;margin-left: auto;margin-right: auto;min-width: 50px;' + style;
                    elem.attr('style', style);
                });
                const contentHtml = $.html();
                html += `<div style="line-height: 1.59;text-align: justify;font-size: 1.0625rem;color: #333;">${contentHtml}</div>`; // 正文

                html += '</div>';
                itemDesc += html;
            }
        }
        return itemDesc;
    },
    formatComments: async (ctx, itemDesc, status, showBloggerIcons) => {
        const routeParams = querystring.parse(ctx.req.param('routeParams'));
        const descriptionRenderParams = getDescriptionRenderParams(routeParams);

        if (status && status.comments_count && status.id && status.mid) {
            const id = status.id;
            const mid = status.mid;
            const link = `https://m.weibo.cn/comments/hotflow?id=${id}&mid=${mid}&max_id_type=0`;
            const response = await cache.tryGet(link, async () => {
                const _response = await got.get(link, {
                    headers: {
                        Referer: `https://m.weibo.cn/detail/${id}`,
                        ...weiboUtils.apiHeaders,
                    },
                });
                return _response.data;
            });
            if (response.data && response.data.data) {
                const comments = response.data.data;
                itemDesc += `<br clear="both" /><div style="clear: both"></div><div style="background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;">`;
                itemDesc += '<h3>热门评论</h3>';
                for (const comment of comments) {
                    itemDesc += '<p style="margin-bottom: 0.5em;margin-top: 0.5em">';
                    let name = comment.user.screen_name;
                    if (showBloggerIcons === '1' && comment.blogger_icons) {
                        name += comment.blogger_icons[0].name;
                    }
                    const commentText = formatDescriptionText(comment.text, descriptionRenderParams);
                    itemDesc += `<a href="https://weibo.com/${comment.user.id}" target="_blank">${name}</a>: ${commentText}`;
                    // 带有图片的评论直接输出图片
                    if ('pic' in comment) {
                        itemDesc += `<br><img src="${comment.pic.url}">`;
                    }
                    if (comment.comments) {
                        itemDesc += '<blockquote style="border-left:0.2em solid #80808080; margin-left: 0.3em; padding-left: 0.5em; margin-bottom: 0.5em; margin-top: 0.25em">';
                        for (const com of comment.comments) {
                            // 评论的带有图片的评论直接输出图片
                            const pattern = /<a\s+href="https:\/\/weibo\.cn\/sinaurl\?u=([^"]+)"[^>]*><span class='url-icon'><img[^>]*><\/span><span class="surl-text">(查看图片|评论配图|查看动图)<\/span><\/a>/g;
                            let replyText = com.text;
                            const matches = replyText.match(pattern);
                            if (matches) {
                                for (const match of matches) {
                                    const hrefMatch = match.match(/href="https:\/\/weibo\.cn\/sinaurl\?u=([^"]+)"/);
                                    if (hrefMatch) {
                                        // 获取并解码 href 中的图片 URL
                                        const imgSrc = decodeURIComponent(hrefMatch[1]);
                                        const imgTag = `<img src="${imgSrc}" style="width: 1rem; height: 1rem;">`;
                                        // 用替换后的 img 标签替换原来的 <a> 标签部分
                                        replyText = replyText.replaceAll(match, imgTag);
                                    }
                                }
                            }
                            replyText = formatDescriptionText(replyText, descriptionRenderParams);
                            itemDesc += '<div style="font-size: 0.9em">';
                            let name = com.user.screen_name;
                            if (showBloggerIcons === '1' && com.blogger_icons) {
                                name += com.blogger_icons[0].name;
                            }
                            itemDesc += `<a href="https://weibo.com/${com.user.id}" target="_blank">${name}</a>: ${replyText}`;
                            itemDesc += '</div>';
                        }
                        itemDesc += '</blockquote>';
                    }
                    itemDesc += '</p>';
                }

                itemDesc += '</div>';
            }
        }
        return itemDesc;
    },
    sinaimgTvax: (() => {
        // https://datatracker.ietf.org/doc/html/rfc1808#section-2.4.3
        const regex = /(?<=\/\/)wx(?=[1-4]\.sinaimg\.cn\/)/gi;
        // const prefixes = ['tva', 'tvax'];
        // let cnt = 0;
        // const replace = (html) => {
        //     cnt = (cnt + 1) % 2;
        //     return html.replace(regex, prefixes[cnt]);
        // };
        const replace = (html) => html.replaceAll(regex, 'tvax'); // enforce `tvax` as `tva` has a strict WAF
        const replaceKV = (obj, keys) => {
            for (const key of keys) {
                if (obj[key]) {
                    obj[key] = replace(obj[key]);
                }
            }
        };
        const dataKeys = ['description', 'image'];
        const itemKeys = ['description'];
        return (data) => {
            if (data) {
                replaceKV(data, dataKeys);
                if (data.item) {
                    for (const item of data.item) {
                        replaceKV(item, itemKeys);
                    }
                }
            }
            return data;
        };
    })(),
};

export default weiboUtils;
