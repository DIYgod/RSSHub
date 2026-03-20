import { load } from 'cheerio';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const videoAPI = 'https://api.ruguoapp.com/1.0/mediaMeta/play?type=ORIGINAL_POST';
const refreshTokenAPI = 'https://api.ruguoapp.com/app_auth_tokens.refresh';
const topicFeedAPI = 'https://api.ruguoapp.com/1.0/topics/tabs/selected/feed';
const topicFeedPageSize = 20;
const jikeRefreshTokenCacheKey = 'JIKE_REFRESH_TOKEN';

const hydrateTopicPosts = async (posts) =>
    await Promise.all(
        posts.map(async (item) => {
            if (!item.video) {
                return item;
            }

            const videoUrl = `${videoAPI}&id=${item.id}`;
            const videoRes = await got(videoUrl);

            return {
                ...item,
                video: videoRes.data,
            };
        })
    );

const mergeTopicPosts = (initialPosts, expandedPosts) => {
    const seen = new Set();

    return [...initialPosts, ...expandedPosts].filter((item) => {
        if (!item?.id || seen.has(item.id)) {
            return false;
        }

        seen.add(item.id);
        return true;
    });
};

const getJikeRefreshToken = async () => (await cache.get(jikeRefreshTokenCacheKey)) || config.jike.refresh_token;

const getJikeAccessToken = async () => {
    const refreshToken = await getJikeRefreshToken();
    if (!refreshToken) {
        return;
    }

    const { data } = await got.post(refreshTokenAPI, {
        headers: {
            'User-Agent': config.trueUA,
            'x-jike-refresh-token': refreshToken,
        },
    });

    if (data?.['x-jike-refresh-token']) {
        cache.set(jikeRefreshTokenCacheKey, data['x-jike-refresh-token']);
    }

    return data?.['x-jike-access-token'];
};

const fetchExpandedTopicPosts = async (topicId, accessToken, loadMoreKey) => {
    const { data } = await got.post(topicFeedAPI, {
        json: {
            limit: topicFeedPageSize,
            loadMoreKey,
            topicId,
        },
        searchParams: {
            tab: 'selected',
        },
        headers: {
            'Content-Type': 'application/json',
            Origin: 'https://web.okjike.com',
            Referer: `https://web.okjike.com/topic/${topicId}`,
            'User-Agent': config.trueUA,
            'x-jike-access-token': accessToken,
        },
    });

    return {
        data: await hydrateTopicPosts(data?.data ?? []),
        loadMoreKey: data?.loadMoreKey,
    };
};

const collectExpandedTopicPosts = async (topicId, accessToken, limit, loadMoreKey, expandedPosts = []) => {
    if (expandedPosts.length >= limit) {
        return expandedPosts;
    }

    const page = await fetchExpandedTopicPosts(topicId, accessToken, loadMoreKey);
    if (page.data.length === 0) {
        return expandedPosts;
    }

    const mergedPosts = mergeTopicPosts(expandedPosts, page.data);
    if (!page.loadMoreKey || page.loadMoreKey === loadMoreKey) {
        return mergedPosts;
    }

    return collectExpandedTopicPosts(topicId, accessToken, limit, page.loadMoreKey, mergedPosts);
};

const getExpandedTopicPosts = async (topicId, initialPosts, limit) => {
    if (limit <= initialPosts.length) {
        return initialPosts;
    }

    try {
        const accessToken = await getJikeAccessToken();
        if (!accessToken) {
            return initialPosts;
        }

        const expandedPosts = await collectExpandedTopicPosts(topicId, accessToken, limit);
        return mergeTopicPosts(initialPosts, expandedPosts);
    } catch {
        return initialPosts;
    }
};

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
            data.posts = await hydrateTopicPosts(data.posts);

            return data;
        },
        config.cache.routeExpire,
        false
    );

    if (!data.posts?.length) {
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

export { constructTopicEntry, getExpandedTopicPosts, topicDataHanding };
