// @ts-nocheck
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import { config } from '@/config';
import { fallback, queryToBoolean } from '@/utils/readable-social';
const { templates, resolveUrl, proxyVideo, getOriginAvatar, universalGet } = require('./utils');

export default async (ctx) => {
    const uid = ctx.req.param('uid');
    if (!uid.startsWith('MS4wLjABAAAA')) {
        throw new Error('Invalid UID. UID should start with <b>MS4wLjABAAAA</b>.');
    }
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const embed = fallback(undefined, queryToBoolean(routeParams.embed), false); // embed video
    const iframe = fallback(undefined, queryToBoolean(routeParams.iframe), false); // embed video in iframe
    const relay = resolveUrl(routeParams.relay, true, true); // embed video behind a reverse proxy

    const pageUrl = `https://www.douyin.com/user/${uid}`;

    const pageData = await cache.tryGet(
        `douyin:user:${uid}`,
        async () => {
            const renderData = await universalGet(pageUrl, 'user');
            const dataKey = Object.keys(renderData).find((key) => renderData[key].user && renderData[key].post);
            return renderData[dataKey];
        },
        config.cache.routeExpire,
        false
    );
    const userInfo = pageData.user.user;
    const userNickName = userInfo.nickname;
    const userDescription = userInfo.desc;
    const userAvatar = getOriginAvatar(userInfo.avatar300Url || userInfo.avatarUrl);

    const posts = pageData.post.data;
    const items = posts.map((post) => {
        // parse video
        let videoList = post.video && post.video.bitRateList && post.video.bitRateList.map((item) => resolveUrl(item.playApi));
        if (relay) {
            videoList = videoList.map((item) => proxyVideo(item, relay));
        }
        let duration = post.video && post.video.duration;
        duration = duration && duration / 1000;
        let img;
        // if (!embed) {
        //     img = post.video && post.video.dynamicCover; // dynamic cover (webp)
        // }
        img =
            img ||
            (post.video &&
                ((post.video.coverUrlList && post.video.coverUrlList.at(-1)) || // HD
                    post.video.originCover || // LD
                    post.video.cover)); // even more LD
        img = img && resolveUrl(img);

        // render description
        const desc = post.desc && post.desc.replaceAll('\n', '<br>');
        let media = art(embed && videoList ? templates.embed : templates.cover, { img, videoList, duration });
        media = embed && videoList && iframe ? art(templates.iframe, { content: media }) : media; // warp in iframe
        const description = art(templates.desc, { desc, media });

        return {
            title: post.desc,
            description,
            link: `https://www.douyin.com/video/${post.awemeId}`,
            pubDate: parseDate(post.createTime * 1000),
            category: post.textExtra.map((extra) => extra.hashtagName),
        };
    });

    ctx.set('data', {
        title: userNickName,
        description: userDescription,
        image: userAvatar,
        link: pageUrl,
        item: items,
    });
};
