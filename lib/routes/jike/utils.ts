import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const videoAPI = 'https://api.ruguoapp.com/1.0/mediaMeta/play?type=ORIGINAL_POST';
const topicDataHanding = (data, ctx) =>
    data.posts.map((item) => {
        let audioName, videoName, linkName;

        // 获取纯文字内容 和 即刻原文链接
        let content, link;
        switch (item.type) {
            case 'ORIGINAL_POST':
                content = item.content;
                link = `https://m.okjike.com/originalPosts/${item.id}`;
                break;

            /* case 'QUESTION':
            content = item.title;
            link = `https://m.okjike.com/questions/${item.id}`;
            break;
        case 'OFFICIAL_MESSAGE':
            content = item.content;
            link = `https://web.okjike.com/message-detail/${item.id}/officialMessage`;
            break;*/
            default:
                content = '未知类型，请前往GitHub提交issue';
                link = 'https://github.com/DIYgod/RSSHub/issues';
        }

        // rss内容
        let description = '';
        // 作者昵称
        let author = '';

        // 添加内容作者信息
        if (item.user) {
            author = item.user.screenName;
            if (ctx.req.param('showUid')) {
                description += `<span>用户昵称：${author} <br> Username：${item.user.username}</span><br>`;
            }
        }

        if (item.linkInfo) {
            const linkUrl = item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl;

            // 对于即刻抓取的微信公众号文章 特殊处理
            // 此时 Rss原文链接 变为 微信公众号链接
            if (new URL(linkUrl).host === 'mp.weixin.qq.com') {
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
            <img src="${audioImage}">
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
            <img src="${videoImage}">
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
                const imageTag = `<img src="${linkImage}">`;
                description += `
            ${linkImage ? imageTag : ''}
            <a href="${linkUrl}">${linkTitle}</a>
        `;
            }
        }

        // 4. 文字内容
        description += description ? `<br>${content}` : content;

        // 5. 图片
        if (item.pictures) {
            for (const pic of item.pictures) {
                if (pic.format === 'gif') {
                    description += `<img src="${pic.picUrl.split('?imageMogr2/')[0]}">`;
                } else {
                    // jpeg, bmp, png, gif, webp
                    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
                    // let type = 'jpeg';
                    // switch (pic.format) {
                    //     case 'bmp':
                    //         type = 'bmp';
                    //         break;
                    //     case 'png':
                    //         type = 'png';
                    //         break;
                    //     default:
                    //         break;
                    // }
                    const imgUrl = /\.[\da-z]+?\?imageMogr2/.test(pic.picUrl) ? pic.picUrl.split('?imageMogr2/')[0] : pic.picUrl.replace(/thumbnail\/.+/, '');
                    description += `<br><img src="${imgUrl}">`;
                    // description += `<br><picture><source srcset="${
                    //     pic.picUrl.split('/thumbnail/')[0]
                    // }/strip/format/webp" type="image/webp"><source srcset="${imgUrl}" type="image/${type}"><img src="${imgUrl}"></picture>`;
                }
            }
        }

        // 6. 视频
        if (item.video) {
            description += `<br><video src="${item.video.url}" controls></video>`;
        }

        // rss标题
        // 优先将音频和视频名作为标题
        // 其次将正文内容作为标题
        // 若都没有 则是推送型消息，将连接标题作为主题
        // “无题” fallback
        const title = audioName || videoName || content || linkName || '无题';

        return {
            title,
            description: description.trim().replaceAll('\n', '<br>'),
            pubDate: parseDate(item.createdAt),
            author,
            link,
        };
    });
const constructTopicEntry = async (ctx, url) => {
    const data = await cache.tryGet(
        url,
        async () => {
            const resp = await got(url);
            const html = resp.data;
            const $ = load(html);
            const raw = $('[type = "application/json"]').html();
            const data = JSON.parse(raw).props.pageProps;
            data.posts = await Promise.all(
                data.posts.map(async (item) => {
                    if (!item.video) {
                        return item;
                    }

                    const videoUrl = `${videoAPI}&id=${item.id}`;
                    const videoRes = await got(videoUrl);
                    item.video = videoRes.data;

                    return item;
                })
            );

            return data;
        },
        false,
        config.cache.routeExpire
    );

    if (data.length === 0) {
        return {
            title: '主题 ID 不存在，或该主题暂无内容',
        };
    }

    const topic = data.topic;

    data.result = {
        title: `${topic.content} - 即刻圈子`,
        link: url,
        description: topic.briefIntro,
        image: topic.squarePicture.picUrl || topic.squarePicture.middlePicUrl || topic.squarePicture.thumbnailUrl,
        // item: topicDataHanding(data),
    };

    return data;
};

export { constructTopicEntry, topicDataHanding };
