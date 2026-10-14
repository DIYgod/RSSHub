import { load } from 'cheerio';
import { escapeAttribute, escapeText } from 'entities';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const videoAPI = 'https://api.ruguoapp.com/1.0/mediaMeta/play?type=ORIGINAL_POST';
const topicDataHanding = (data, ctx) =>
    data.posts.map((item) => {
        let audioName, videoName, linkName;

        // Read the post text and original webpage link.
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

        // Render the entry body.
        let description = '';
        // Read the author display name.
        let author = '';

        // Include author details when requested.
        if (item.user) {
            author = item.user.screenName;
            if (ctx.req.param('showUid')) {
                description += `<span>用户昵称：${escapeText(author)} <br> Username：${escapeText(item.user.username)}</span><br>`;
            }
        }

        if (item.linkInfo) {
            const linkUrl = item.linkInfo.originalLinkUrl || item.linkInfo.linkUrl;

            // Use the original WeChat article link when available.
            // The entry then links directly to the WeChat article.
            if (new URL(linkUrl).host === 'mp.weixin.qq.com') {
                link = linkUrl;
            }

            // 1. Audio
            const audioObject = item.linkInfo.audio || item.audio;
            if (audioObject) {
                const audioImage = audioObject.image.picUrl || audioObject.image.thumbnailUrl;
                const audioLink = linkUrl;
                const audioTitle = audioObject.title;
                const audioAuthor = audioObject.author;
                audioName = `${audioTitle} - ${audioAuthor}`;
                description += `
            <img src="${escapeAttribute(audioImage)}">
            <a href="${escapeAttribute(audioLink)}">${escapeText(audioName)}</a>
        `;
            }

            // 2. Video
            const videoObject = item.linkInfo.video || item.video;
            if (videoObject) {
                const videoImage = videoObject.image.picUrl || videoObject.image.thumbnailUrl;
                const videoLink = linkUrl;
                const videoDuration = Math.floor(videoObject.duration / 60000);
                videoName = item.linkInfo.title;
                description += `
            <img src="${escapeAttribute(videoImage)}">
            <a href="${escapeAttribute(videoLink)}">${escapeText(videoName || '观看视频')} - 约${videoDuration}分钟</a>
        `;
            }

            // 3. Links
            if (!audioObject && !videoObject && linkUrl) {
                // Some links provide a title.
                linkName = item.linkInfo.title;
                const linkTitle = linkName || '访问原文';
                // Some links provide a thumbnail.
                const linkImage = item.linkInfo.pictureUrl;
                const imageTag = `<img src="${escapeAttribute(linkImage)}">`;
                description += `
            ${linkImage ? imageTag : ''}
            <a href="${escapeAttribute(linkUrl)}">${escapeText(linkTitle)}</a>
        `;
            }
        }

        // 4. Post text
        description += description ? `<br>${escapeText(content)}` : escapeText(content);

        // 5. Images
        if (item.pictures) {
            for (const pic of item.pictures) {
                if (pic.format === 'gif') {
                    description += `<img src="${escapeAttribute(pic.picUrl.split('?imageMogr2/', 1)[0])}">`;
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
                    const imgUrl = /\.[\da-z]+\?imageMogr2/.test(pic.picUrl) ? pic.picUrl.split('?imageMogr2/', 1)[0] : pic.picUrl.replace(/thumbnail\/.+/, '');
                    description += `<br><img src="${escapeAttribute(imgUrl)}">`;
                    // description += `<br><picture><source srcset="${
                    //     pic.picUrl.split('/thumbnail/')[0]
                    // }/strip/format/webp" type="image/webp"><source srcset="${escapeAttribute(imgUrl)}" type="image/${type}"><img src="${escapeAttribute(imgUrl)}"></picture>`;
                }
            }
        }

        // 6. Video
        if (item.video) {
            description += `<br><video src="${escapeAttribute(item.video.url)}" controls></video>`;
        }

        // Select the entry title.
        // Prefer audio and video titles.
        // Otherwise use the post text.
        // Fall back to a linked article title for notification posts.
        // Use an untitled fallback when no title is available.
        const title = audioName || videoName || content || linkName || '无题';

        return {
            title,
            description: description.trim().replaceAll('\n', '<br>'),
            pubDate: parseCreatedAt(item.createdAt),
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
            const data = JSON.parse(raw ?? '').props.pageProps;
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
        config.cache.routeExpire,
        false
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

function parseCreatedAt(value?: string): Date | undefined {
    const date = value ? parseDate(value) : undefined;
    return date && Number.isFinite(date.getTime()) ? date : undefined;
}

export { constructTopicEntry, parseCreatedAt, topicDataHanding };
