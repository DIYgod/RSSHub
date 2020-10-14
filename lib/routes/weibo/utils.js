const got = require('@/utils/got');

const weiboUtils = {
    format: (status) => weiboUtils.formatWithRetweet(status).description,
    formatWithRetweet: (status, showAuthorAvatar = true) => {
        let retweetedOrOriginal = '';
        // 长文章的处理
        let temp = (status.longText && status.longText.longTextContent) || status.text || '';
        // 表情图标转换为文字
        temp = temp.replace(/<span class="url-icon"><img.*?alt="?(.*?)"? [\s\S]*?\/><\/span>/g, '$1');
        // 去掉外部链接的图标
        temp = temp.replace(/<span class=["|']url-icon["|']>.*?<\/span><span class="surl-text">(.*?)<\/span>/g, '$1');
        // 去掉乱七八糟的图标
        temp = temp.replace(/<span class=["|']url-icon["|']>(.*?)<\/span>/g, '');
        // 去掉全文
        temp = temp.replace(/全文<br>/g, '<br>');
        temp = temp.replace(/<a href="(.*?)">全文<\/a>/g, '');

        // 处理外部链接
        temp = temp.replace(/https:\/\/weibo\.cn\/sinaurl\/.*?&u=(http.*?")/g, function (match, p1) {
            return decodeURIComponent(p1);
        });

        let originalText = temp;
        temp = temp.replace(/\n/g, '<br>');

        // 添加用户名和头像
        let usernameAndAvatar = `<a href="https://weibo.com/${status.user.id}">`;
        if (showAuthorAvatar) {
            usernameAndAvatar += `<img align="left" width="48" src="${status.user.profile_image_url}" hspace="8" vspace="8" />`;
        }
        usernameAndAvatar += `<strong>${status.user.screen_name}</strong></a>:&nbsp;&nbsp;`;
        temp = usernameAndAvatar + temp;

        // 处理转发的微博
        if (status.retweeted_status) {
            temp += `<br clear="both" /><div style="clear: both"></div><blockquote>`;
            if (!status.retweeted_status.user) {
                // 当转发的微博被删除时user为null
                status.retweeted_status.user = '微博已删除';
            }
            // 插入转发的微博
            retweetedOrOriginal += weiboUtils.formatWithRetweet(status.retweeted_status, false).description;
            temp +=
                retweetedOrOriginal +
                `<br><small>原博：<a href="https://weibo.com/${status.retweeted_status.user.id}/${status.retweeted_status.bid}" target="_blank" rel="noopener noreferrer">https://weibo.com/${status.retweeted_status.user.id}/${status.retweeted_status.bid}</a></small><br><small>` +
                new Date(status.retweeted_status.created_at).toLocaleString() +
                '</small><br clear="both" /><div style="clear: both"></div></blockquote>';
        }

        // 添加微博配图
        if (status.pics) {
            temp += '<br clear="both" /><div style="clear: both"></div>';
            status.pics.forEach(function (item) {
                temp += '<a href="' + item.large.url + '"><img vspace="8" hspace="4" src="' + item.large.url + '"></a>';
                originalText += '<img src="">';
            });
        }

        return { description: temp, retweetedOrOriginal: status.retweeted_status ? '🔁 ' + retweetedOrOriginal : originalText.replace('\n', '') };
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
            const mediaInfo = pageInfo.media_info;
            const posterUrl = pagePic ? pagePic.url : '';
            const videoUrl = mediaInfo ? mediaInfo.stream_url_hd || mediaInfo.stream_url || mediaInfo.mp4_hd_url || mediaInfo.mp4_sd_url || mediaInfo.mp4_720p_mp4 : '';
            if (videoUrl) {
                const video = `<br clear="both" /><div style="clear: both"></div><video src="${videoUrl}"  controls="controls" poster="${posterUrl}" style="width: 100%"></video>`;
                itemDesc += video;
            }
        }
        return itemDesc;
    },
};

module.exports = weiboUtils;
