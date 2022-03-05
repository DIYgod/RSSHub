const querystring = require('querystring');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { fallback, queryToBoolean, queryToInteger } = require('@/utils/readable-social');

const weiboUtils = {
    formatExtended: (ctx, status, params = {}, picsPrefixes = []) => {
        // undefined and strings like "1" is also safely parsed, so no if branch is needed
        const routeParams = querystring.parse(ctx.params.routeParams);

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
            showEmojiInDescription: fallback(params.showEmojiInDescription, queryToInteger(routeParams.showEmojiInDescription), true),
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
            showEmojiInDescription,
        } = params;

        let retweeted = '';
        // 长文章的处理
        let htmlNewLineUnreplaced = (status.longText && status.longText.longTextContent) || status.text || '';
        // 表情图标转换为文字
        if (!showEmojiInDescription) {
            htmlNewLineUnreplaced = htmlNewLineUnreplaced.replace(/<span class=["']url-icon["']><img\s[^>]*?alt=["']?([^>]+?)["']?\s[^>]*?\/><\/span>/g, '$1');
        }
        // 去掉外部链接的图标，保留 a 标签链接  // 不能去掉，否则像超话这样的有意义的图标也会被去掉
        // htmlNewLineUnreplaced = htmlNewLineUnreplaced.replace(/(<a\s[^>]*>)<span class=["']url-icon["']><img\s[^>]*><\/span>[^<>]*?<span class="surl-text">([^<>]*?)<\/span><\/a>/g, '$1$2</a>');
        // 去掉乱七八糟的图标  // 不能去掉，否则像超话这样的有意义的图标也会被去掉
        // htmlNewLineUnreplaced = htmlNewLineUnreplaced.replace(/<span class=["']url-icon["']>(<img\s[^>]*?>)<\/span>/g, '');
        // 去掉全文
        htmlNewLineUnreplaced = htmlNewLineUnreplaced.replace(/全文<br>/g, '<br>');
        htmlNewLineUnreplaced = htmlNewLineUnreplaced.replace(/<a href="(.*?)">全文<\/a>/g, '');

        // 处理外部链接
        htmlNewLineUnreplaced = htmlNewLineUnreplaced.replace(/https:\/\/weibo\.cn\/sinaurl\/.*?&u=(http.*?")/g, (match, p1) => decodeURIComponent(p1));

        let html = htmlNewLineUnreplaced.replace(/\n/g, '<br>');

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
            if (authorNameBold) {
                usernameAndAvatar += `<strong>${name}</strong></a>:&ensp;`;
            } else {
                usernameAndAvatar += `${name}</a>:&ensp;`;
            }
            html = usernameAndAvatar + html;
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

        // 添加微博配图
        if (status.pics) {
            if (readable) {
                html += '<br clear="both" /><div style="clear: both"></div>';
            }

            // 一些RSS Reader会识别所有<img>标签作为内含图片显示，我们不想要头像也作为内含图片之一
            // 让所有配图在description的最前面再次出现一次，但宽高设为0
            let picsPrefix = '';
            status.pics.forEach((item) => {
                picsPrefix += `<img width="0" height="0" hidden="true" src="${item.large.url}">`;
            });
            picsPrefixes.push(picsPrefix);

            status.pics.forEach((item) => {
                if (addLinkForPics) {
                    html += '<a href="' + item.large.url + '">';
                }

                let style = '';
                html += '<img ';
                html += readable ? 'vspace="8" hspace="4"' : '';
                if (widthOfPics >= 0) {
                    html += ` width="${widthOfPics}"`;
                    style += `width: ${widthOfPics}px;`;
                }
                if (heightOfPics >= 0) {
                    html += ` height="${heightOfPics}"`;
                    style += `height: ${heightOfPics}px;`;
                }
                html += ` style="${style}"` + ' src="' + item.large.url + '">';

                if (addLinkForPics) {
                    html += '</a>';
                }

                if (!readable) {
                    html += '<br><br>';
                }

                htmlNewLineUnreplaced += '<img src="" />';
            });
        }

        // 处理转发的微博
        if (status.retweeted_status) {
            if (readable) {
                html += `<br clear="both" /><div style="clear: both"></div><blockquote style="background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;">`;
            } else {
                html += `<br><blockquote> - 转发 `;
            }
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
            retweeted += weiboUtils.formatExtended(ctx, status.retweeted_status, retweetedParams, picsPrefixes).description;

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
            title += htmlNewLineUnreplaced
                .replace(/<span class=["']url-icon["']><img\s[^>]*?alt=["']?([^>]+?)["']?\s[^>]*?\/><\/span>/g, '$1') // 表情转换
                .replace(/<span class=["']url-icon["']>(<img\s[^>]*?>)<\/span>/g, '') // 去掉所有图标
                .replace(/<img[\s\S]*?>/g, '[图片]')
                .replace(/<.*?>/g, '')
                .replace('\n', '');
        }
        if (status.retweeted_status) {
            title += showEmojiForRetweet ? '🔁 ' : ' - 转发 ';
            title += retweeted
                .replace(/<span class=["']url-icon["']><img\s[^>]*?alt=["']?([^>]+?)["']?\s[^>]*?\/><\/span>/g, '$1') // 表情转换
                .replace(/<span class=["']url-icon["']>(<img\s[^>]*?>)<\/span>/g, '') // 去掉所有图标
                .replace(/<img[\s\S]*?>/g, '[图片]')
                .replace(/<.*?>/g, '')
                .replace('\n', '');
        }

        return { description: html, title };
    },
    getShowData: async (uid, bid) => {
        const link = `https://m.weibo.cn/statuses/show?id=${bid}`;
        const itemResponse = await got.get(link, {
            headers: {
                Referer: `https://m.weibo.cn/u/${uid}`,
                'MWeibo-Pwa': 1,
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
            },
        });
        return itemResponse.data.data;
    },
    formatVideo: (itemDesc, status) => {
        const pageInfo = status.page_info;
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
                let video = '<br clear="both" /><div style="clear: both"></div>';
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
                itemDesc += video;
            }
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
            const response = await ctx.cache.tryGet(link, async () => {
                const _response = await got.get(link, {
                    headers: {
                        Referer: `https://card.weibo.com/article/m/show/id/${articleId}`,
                        'MWeibo-Pwa': 1,
                        'X-Requested-With': 'XMLHttpRequest',
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
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
                const $ = cheerio.load(content);
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
};

module.exports = weiboUtils;
