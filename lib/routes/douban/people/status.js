const querystring = require('querystring');
const got = require('@/utils/got');
const { fallback, queryToBoolean, queryToInteger } = require('@/utils/readable-social');

const headers = { Referer: `https://m.douban.com/` };

function tryFixStatus(status) {
    let result = { isFixSuccess: true, why: '' };
    const now = new Date();

    if (!status) {
        result = {
            isFixSuccess: false,
            // 添加方括号，与 status.msg 的样式统一
            why: '[ 无内容 ]',
        };
        status = {}; // dummy
    } else if (status.deleted) {
        result = {
            isFixSuccess: false,
            why: status.msg ? status.msg : '[ 内容已被删除 ]',
        };
    } else if (status.hidden) {
        result = {
            isFixSuccess: false,
            why: status.msg ? status.msg : '[ 内容已被设为不可见 ]',
        };
    } else if (!status.activity || status.text === undefined || status.text === null || !status.uri) {
        result = {
            isFixSuccess: false,
            why: status.msg ? status.msg : '[ 内容已不可访问 ]',
        };
    } else {
        if (!status.author) {
            status.author = {};
        }
        if (!status.author.url) {
            status.author.url = 'https://www.douban.com/people/1/';
        }
        if (!status.author.name) {
            status.author.name = '[作者不可见]';
        }
        if (!status.author.avatar) {
            status.author.avatar = 'https://img1.doubanio.com/icon/user_normal.jpg';
        }
        if (!status.create_time) {
            status.create_time = now.toLocaleString();
        }
        if (!status.entities) {
            status.entities = [];
        }
    }

    if (!result.isFixSuccess) {
        status.sharing_url = 'https://www.douban.com?rsshub_failed=' + now.getTime().toString();
        if (!status.create_time) {
            status.create_time = now.toLocaleString();
        }
    }
    return result;
}

function getContentByActivity(ctx, item, params = {}, picsPrefixes = []) {
    const routeParams = querystring.parse(ctx.params.routeParams);

    const mergedParams = {
        readable: fallback(params.readable, queryToBoolean(routeParams.readable), false),
        authorNameBold: fallback(params.authorNameBold, queryToBoolean(routeParams.authorNameBold), false),
        showAuthorInTitle: fallback(params.showAuthorInTitle, queryToBoolean(routeParams.showAuthorInTitle), true),
        showAuthorInDesc: fallback(params.showAuthorInDesc, queryToBoolean(routeParams.showAuthorInDesc), false),
        showAuthorAvatarInDesc: fallback(params.showAuthorAvatarInDesc, queryToBoolean(routeParams.showAuthorAvatarInDesc), false),
        showEmojiForRetweet: fallback(params.showEmojiForRetweet, queryToBoolean(routeParams.showEmojiForRetweet), false),
        showRetweetTextInTitle: fallback(params.showRetweetTextInTitle, queryToBoolean(routeParams.showRetweetTextInTitle), false),
        addLinkForPics: fallback(params.addLinkForPics, queryToBoolean(routeParams.addLinkForPics), false),
        showTimestampInDescription: fallback(params.showTimestampInDescription, queryToBoolean(routeParams.showTimestampInDescription), false),
        showComments: fallback(params.showComments, queryToBoolean(routeParams.showComments), false),

        showColonInDesc: fallback(params.showColonInDesc, null, false),

        widthOfPics: fallback(params.widthOfPics, queryToInteger(routeParams.widthOfPics), -1),
        heightOfPics: fallback(params.heightOfPics, queryToInteger(routeParams.heightOfPics), -1),
        sizeOfAuthorAvatar: fallback(params.sizeOfAuthorAvatar, queryToInteger(routeParams.sizeOfAuthorAvatar), 48),
    };

    params = mergedParams;

    const {
        readable,
        authorNameBold,
        showAuthorInTitle,
        showAuthorInDesc,
        showAuthorAvatarInDesc,
        showEmojiForRetweet,
        showRetweetTextInTitle,
        addLinkForPics,
        showTimestampInDescription,
        showComments,

        showColonInDesc,

        widthOfPics,
        heightOfPics,
        sizeOfAuthorAvatar,
    } = params;

    const { status, comments } = item;
    const { isFixSuccess, why } = tryFixStatus(status);
    if (!isFixSuccess) {
        return {
            title: why,
            description: why,
        };
    }

    let description = '';
    let title = '';

    let activityInDesc;
    let activityInTitle;

    const { isFixSuccess: isResharedFixSuccess, why: resharedWhy } = tryFixStatus(status.reshared_status);

    if (status.activity !== '转发') {
        activityInDesc = status.activity;
        activityInTitle = status.activity;
    } else {
        if (!isResharedFixSuccess) {
            activityInDesc = `转发广播`;
            activityInTitle = `转发广播`;
        } else {
            activityInDesc = '转发 ';
            if (readable) {
                activityInDesc += `<a href="${status.reshared_status.author.url}" target="_blank" rel="noopener noreferrer">`;
            }
            if (authorNameBold) {
                activityInDesc += `<strong>`;
            }
            activityInDesc += status.reshared_status.author.name;
            if (authorNameBold) {
                activityInDesc += `</strong>`;
            }
            if (readable) {
                activityInDesc += `</a>`;
            }
            activityInDesc += ` 的广播`;
            activityInTitle = `转发 ${status.reshared_status.author.name} 的广播`;
        }
    }

    if (showAuthorInDesc) {
        let usernameAndAvatar = '';
        if (readable) {
            usernameAndAvatar += `<a href="${status.author.url}" target="_blank" rel="noopener noreferrer">`;
        }
        if (showAuthorAvatarInDesc) {
            usernameAndAvatar += `<img width="${sizeOfAuthorAvatar}" height="${sizeOfAuthorAvatar}" src="${status.author.avatar}" ${readable ? 'hspace="8" vspace="8" align="left"' : ''} />`;
        }
        if (authorNameBold) {
            usernameAndAvatar += `<strong>`;
        }
        usernameAndAvatar += status.author.name;
        if (authorNameBold) {
            usernameAndAvatar += `</strong>`;
        }
        if (readable) {
            usernameAndAvatar += `</a>`;
        }
        usernameAndAvatar += `&ensp;`;
        description += usernameAndAvatar + activityInDesc + (showColonInDesc ? ': ' : '');
    }

    if (showAuthorInTitle) {
        title += `${status.author.name} `;
    }
    title += `${activityInTitle}: `;

    if (showTimestampInDescription) {
        description += `<br><small>${status.create_time}</small><br>`;
    }

    let text = status.text;
    let lastIndex = 0;
    const replacedTextSegements = [];
    for (const entity of status.entities) {
        replacedTextSegements.push(text.slice(lastIndex, entity.start));
        replacedTextSegements.push(`<a href="${entity.uri.replace('douban://douban.com', 'https://www.douban.com/doubanapp/dispatch?uri=')}" target="_blank" rel="noopener noreferrer">${entity.title}</a>`);
        lastIndex = entity.end;
    }
    replacedTextSegements.push(text.slice(lastIndex));
    text = replacedTextSegements.join('');

    // text // images // video_info // parent status

    description += text;

    if (status.card) {
        if (status.card.rating) {
            title += `《${status.card.title}》`;
        } else {
            title += `「${status.card.title}」`;
        }
    }

    if (status.activity !== '转发' || showRetweetTextInTitle) {
        title += status.text.replace('\n', '');
    }

    if (status.images && status.images.length) {
        if (readable) {
            description += `<br clear="both" /><div style="clear: both"></div>`;
        } else {
            description += `<br>`;
        }

        // 一些RSS Reader会识别所有<img>标签作为内含图片显示，我们不想要头像也作为内含图片之一
        // 让所有配图在description的最前面再次出现一次，但宽高设为0
        let picsPrefix = '';
        status.images.forEach((image) => {
            if (!(image.large && image.large.url)) {
                return;
            }
            picsPrefix += `<img width="0" height="0" hidden="true" src="${image.large.url}">`;
        });
        picsPrefixes.push(picsPrefix);

        status.images.forEach((image) => {
            if (!(image.large && image.large.url)) {
                description += '[无法显示的图片]';
                return;
            }

            if (addLinkForPics) {
                description += '<a href="' + image.large.url + '" target="_blank" rel="noopener noreferrer">';
            }
            if (!readable) {
                description += '<br>';
            }
            let style = '';
            description += '<img ';
            if (widthOfPics >= 0) {
                description += ` width="${widthOfPics}"`;
                style += `width: ${widthOfPics}px;`;
            }
            if (heightOfPics >= 0) {
                description += `height="${heightOfPics}" `;
                style += `height: ${heightOfPics}px;`;
            }
            description += ` style="${style}" ` + (readable ? 'vspace="8" hspace="4" ' : '') + ' src="' + image.large.url + '">';
            if (addLinkForPics) {
                description += '</a>';
            }
        });
    }

    if (status.video_info) {
        if (readable) {
            description += `<br clear="both" /><div style="clear: both"></div>`;
        } else {
            description += `<br>`;
        }
        const videoCover = status.video_info.cover_url;
        const videoSrc = status.video_info.video_url;
        if (videoSrc) {
            description = `
                ${description}
                <video
                    src="${videoSrc}"
                    ${videoCover ? `poster="${videoCover}"` : ''}
                >
                </video>
            `;
        }
    }

    if (status.parent_status) {
        description += showEmojiForRetweet ? ' 🔁 ' : ' Fw: ';
        if (showRetweetTextInTitle) {
            title += showEmojiForRetweet ? ' 🔁 ' : ' Fw: ';
        }

        const { isFixSuccess: isParentFixSuccess, why: parentWhy } = tryFixStatus(status.parent_status);

        if (!isParentFixSuccess) {
            description += parentWhy;
            if (showRetweetTextInTitle) {
                title += parentWhy;
            }
        } else {
            let usernameAndAvatar = '';

            if (readable) {
                usernameAndAvatar += `<a href="${status.parent_status.author.url}">`;
            }
            if (authorNameBold) {
                usernameAndAvatar += `<strong>`;
            }
            usernameAndAvatar += status.parent_status.author.name;
            if (authorNameBold) {
                usernameAndAvatar += `</strong>`;
            }
            if (readable) {
                usernameAndAvatar += `</a>`;
            }
            usernameAndAvatar += `:&ensp;`;
            description += usernameAndAvatar + status.parent_status.text;
            if (showRetweetTextInTitle) {
                title += status.parent_status.author.name + ': ' + status.parent_status.text;
            }
        }
    }

    // card
    if (status.card) {
        let image;
        if (status.card.image && (status.card.image.large || status.card.image.normal)) {
            image = status.card.image.large || status.card.image.normal;
        }

        if (readable) {
            description += `<br clear="both" /><div style="clear: both"></div><blockquote style="background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;">`;
        } else {
            description += `<br>`;
        }
        if (image) {
            description += `<img src="${image.url}" ${readable ? 'vspace="0" hspace="12" align="left" height="75" style="height: 75px;"' : ''} />`;
        }

        if (!status.card.title) {
            status.card.title = '[空]';
        }
        if (!status.card.subtitle) {
            status.card.subtitle = '[空]';
        }
        if (!status.card.url) {
            status.card.url = 'https://www.douban.com';
        }

        description += `<a href="${status.card.url}" target="_blank" rel="noopener noreferrer"><strong>${status.card.title}</strong><br><small>${status.card.subtitle}</small>`;
        if (status.card.rating) {
            description += `<br><small>评分：${status.card.rating.value}</small>`;
        }
        description += `</a>`;
        if (readable) {
            description += `<br clear="both" /><div style="clear: both"></div></blockquote>`;
        }
    }

    // video_card
    if (status.video_card) {
        if (readable) {
            description += `<br clear="both" /><div style="clear: both"></div><blockquote style="background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;">`;
        } else {
            description += `<br>`;
        }
        const videoCover = status.video_card.video_info && status.video_card.video_info.cover_url;
        const videoSrc = status.video_card.video_info && status.video_card.video_info.video_url;

        if (!status.video_card.url) {
            status.video_card.url = 'https://www.douban.com';
        }

        description += `${videoSrc ? `<video src="${videoSrc}" ${videoCover ? `poster="${videoCover}"` : ''}></video>` : ''}<br>${status.video_card.title ? `<a href="${status.video_card.url}">${status.video_card.title}</a>` : ''}`;
        if (readable) {
            description += `</blockquote>`;
        }
    }

    // reshared_status
    if (status.reshared_status) {
        if (readable) {
            description += `<br clear="both" /><div style="clear: both"></div><blockquote style="background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;">`;
        } else {
            description += `<br>`;
        }

        if (showRetweetTextInTitle) {
            title += ' | ';
        }

        if (!isResharedFixSuccess) {
            description += resharedWhy;
            title += resharedWhy;
        } else {
            description += getContentByActivity(
                ctx,
                { status: status.reshared_status, comments: [] },
                {
                    showAuthorInDesc: true,
                    showAuthorAvatarInDesc: false,
                    showComments: false,
                    showColonInDesc: true,
                },
                picsPrefixes
            ).description;
            title += status.reshared_status.text;
            const reshared_url = status.reshared_status.uri.replace('douban://douban.com', 'https://www.douban.com/doubanapp/dispatch?uri=');

            if (readable) {
                description += `<br><small>原动态：<a href="${reshared_url}" target="_blank" rel="noopener noreferrer">${reshared_url}</a></small><br clear="both" /><div style="clear: both"></div></blockquote>`;
            }
        }
    }

    // comments
    if (showComments) {
        if (comments.length > 0) {
            description += '<hr>';
        }
        for (const comment of comments) {
            description += `<br>${comment.text} - <a href="${comment.author.url}" target="_blank" rel="noopener noreferrer">${comment.author.name}</a>`;
        }
    }

    if (showAuthorInDesc && showAuthorAvatarInDesc) {
        description = picsPrefixes.join('') + description;
    }
    description = description.trim().replace(/\n/g, '<br>');
    return { title, description };
}

async function getFullTextItems(ctx, items) {
    const prefix = 'https://m.douban.com/rexxar/api/v2/status/';

    await Promise.all(
        items.map(async (item) => {
            let url = prefix + item.status.id;
            let cache = await ctx.cache.get(url);
            if (cache) {
                item.status.text = cache;
            } else {
                const {
                    data: { text },
                } = await got({ url, headers });
                ctx.cache.set(url, text);
                item.status.text = text;
            }
            // retweet
            if (!item.status.reshared_status) {
                return;
            }
            url = prefix + item.status.reshared_status.id;
            cache = await ctx.cache.get(url);
            if (cache) {
                item.status.reshared_status.text = cache;
            } else if (tryFixStatus(item.status.reshared_status).isFixSuccess) {
                const {
                    data: { text },
                } = await got({ url, headers });
                ctx.cache.set(url, text);
                item.status.reshared_status.text = text;
            }
        })
    );
}

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `https://m.douban.com/rexxar/api/v2/status/user_timeline/${userid}`;
    const response = await got({ url, headers });
    const items = response.data.items;

    if (items) {
        await getFullTextItems(ctx, items);
    }

    ctx.state.data = {
        title: `豆瓣广播 - ${items ? items[0].status.author.name : userid}`,
        link: `https://m.douban.com/people/${userid}/statuses`,
        item:
            items &&
            items
                .filter((item) => !item.deleted)
                .map((item) => {
                    const r = getContentByActivity(ctx, item);
                    return {
                        title: r.title,
                        link: item.status.sharing_url.replace(/\?_i=(.*)/, ''),
                        pubDate: new Date(Date.parse(item.status.create_time + ' GMT+0800')).toUTCString(),
                        description: r.description,
                    };
                }),
    };
};
