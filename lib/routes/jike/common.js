const url = require('url');

module.exports = {
    emptyResponseCheck: (ctx, data) => {
        if (data.length === 0) {
            ctx.state.data = {
                title: '主题 ID 不存在，或该主题暂无内容',
            };
            return true;
        }
    },
    topicDataHanding: (data) =>
        data.map((item) => {
            let audioName, videoName, linkName;

            // 获取纯文字内容 和 即刻原文链接
            let content, link;
            switch (item.type) {
                case 'OFFICIAL_MESSAGE':
                    content = item.content;
                    link = `https://web.okjike.com/message-detail/${item.id}/officialMessage`;
                    break;
                case 'ORIGINAL_POST':
                    content = item.content;
                    link = `https://web.okjike.com/post-detail/${item.id}/originalPost`;
                    break;
                case 'QUESTION':
                    content = item.title;
                    link = `https://m.okjike.com/questions/${item.id}`;
                    break;
                default:
                    content = '未知类型，请前往GitHub提交issue';
                    link = 'https://github.com/DIYgod/RSSHub/issues';
            }

            // rss内容
            let description = '';

            if (item.linkInfo) {
                const linkUrl = item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl;

                // 对于即刻抓取的微信公众号文章 特殊处理
                // 此时 Rss原文链接 变为 微信公众号链接
                if (url.parse(linkUrl).host === 'mp.weixin.qq.com') {
                    link = linkUrl;
                }

                // 1. 音频
                const audioObject = item.linkInfo.audio || item.audio;
                if (audioObject) {
                    const audioImage = audioObject.image.picUrl || audioObject.image.thumbnailUrl;
                    const audioLink = linkUrl;
                    const audioTitle = audioObject.title;
                    const audioAuthor = audioObject.author;
                    audioName = `${audioTitle} - ${audioAuthor}`;
                    description += `
                    <img referrerpolicy="no-referrer" src="${audioImage}"/>
                    <a href="${audioLink}">${audioName}</a>
                `;
                }

                // 2. 视频
                const videoObject = item.linkInfo.video || item.video;
                if (videoObject) {
                    const videoImage = videoObject.image.picUrl || videoObject.image.thumbnailUrl;
                    const videoLink = linkUrl;
                    const videoDuration = Math.floor(videoObject.duration / 60000);
                    videoName = item.linkInfo.title;
                    description += `
                    <img referrerpolicy="no-referrer" src="${videoImage}"/>
                    <a href="${videoLink}">${videoName || '观看视频'} - 约${videoDuration}分钟</a>
                `;
                }

                // 3. 链接
                if (!audioObject && !videoObject && linkUrl) {
                    // 部分链接有标题
                    linkName = item.linkInfo.title;
                    const linkTitle = linkName || '访问原文';
                    // 部分链接有缩略图
                    const linkImage = item.linkInfo.pictureUrl;
                    const imageTag = `<img referrerpolicy="no-referrer" src="${linkImage}"/>`;
                    description += `
                    ${linkImage ? imageTag : ''}
                    <a href="${linkUrl}">${linkTitle}</a>
                `;
                }
            }

            // 4. 文字内容
            description += `<br/>${content}`;

            // 5. 图片
            if (item.pictures) {
                item.pictures.forEach((pic) => {
                    if (pic.format === 'gif') {
                        description += `<img referrerpolicy="no-referrer" src="${pic.picUrl.split('?imageMogr2/')[0]}"></picture>`;
                    } else {
                        // jpeg, bmp, png, gif, webp
                        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
                        let type = 'jpeg';
                        switch (pic.format) {
                            case 'bmp':
                                type = 'bmp';
                                break;
                            case 'png':
                                type = 'png';
                                break;
                            default:
                                break;
                        }
                        const imgUrl = pic.picUrl.match(/\.[a-z0-9]+?\?imageMogr2/) ? pic.picUrl.split('?imageMogr2/')[0] : pic.picUrl.replace(/thumbnail\/.+/, '');
                        description += `<br/><picture><source srcset="${
                            pic.picUrl.split('/thumbnail/')[0]
                        }/strip/format/webp" type="image/webp"><source srcset="${imgUrl}" type="image/${type}"><img referrerpolicy="no-referrer" src="${imgUrl}"></picture>`;
                    }
                });
            }

            // rss标题
            // 优先将音频和视频名作为标题
            // 其次将正文内容作为标题
            // 若都没有 则是推送型消息，将连接标题作为主题
            // “无题” fallback
            const title = audioName || videoName || content || linkName || '无题';

            return {
                title,
                description: description.replace(new RegExp('\n', 'g'), '<br/>'),
                pubDate: new Date(item.createdAt).toUTCString(),
                link: link,
            };
        }),
};
