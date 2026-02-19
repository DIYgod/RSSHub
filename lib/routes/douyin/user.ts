import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';
import { fallback, queryToBoolean } from '@/utils/readable-social';

import type { PostData } from './types';
import { getOriginAvatar, proxyVideo, resolveUrl, templates } from './utils';

export const route: Route = {
    path: '/user/:uid/:routeParams?',
    categories: ['social-media'],
    example: '/douyin/user/MS4wLjABAAAARcAHmmF9mAG3JEixq_CdP72APhBlGlLVbN-1eBcPqao',
    parameters: { uid: 'uid，可在用户页面 URL 中找到', routeParams: '额外参数，query string 格式，请参阅上面的表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['douyin.com/user/:uid'],
            target: '/user/:uid',
        },
    ],
    name: '博主',
    maintainers: ['Max-Tortoise', 'Rongronggg9'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    if (!uid.startsWith('MS4wLjABAAAA')) {
        throw new InvalidParameterError('Invalid UID. UID should start with <b>MS4wLjABAAAA</b>.');
    }
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const embed = fallback(undefined, queryToBoolean(routeParams.embed), false); // embed video
    const iframe = fallback(undefined, queryToBoolean(routeParams.iframe), false); // embed video in iframe
    const relay = resolveUrl(routeParams.relay, true, true); // embed video behind a reverse proxy

    const pageUrl = `https://www.douyin.com/user/${uid}`;

    const pageData = (await cache.tryGet(
        `douyin:user:${uid}`,
        async () => {
            let postData;
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
            });
            page.on('response', async (response) => {
                const request = response.request();
                if (request.url().includes('/web/aweme/post') && !postData) {
                    postData = await response.json();
                }
            });

            logger.http(`Requesting ${pageUrl}`);
            await page.goto(pageUrl, {
                waitUntil: 'networkidle2',
            });

            await browser.close();

            if (!postData) {
                throw new Error('Empty post data. The request may be filtered by WAF.');
            }

            return postData;
        },
        config.cache.routeExpire,
        false
    )) as PostData;

    if (!pageData.aweme_list?.length) {
        throw new Error('Empty post data. The request may be filtered by WAF.');
    }
    const userInfo = pageData.aweme_list[0].author;
    const userNickName = userInfo.nickname;
    // const userDescription = userInfo.desc;
    const userAvatar = getOriginAvatar(userInfo.avatar_thumb.url_list.at(-1));

    const items = pageData.aweme_list.map((post) => {
        // parse video
        let videoList = post.video?.bit_rate?.map((item) => resolveUrl(item.play_addr.url_list.at(-1)));
        if (relay) {
            videoList = videoList.map((item) => proxyVideo(item, relay));
        }
        let duration = post.video?.duration;
        duration = duration && duration / 1000;
        let img;
        // if (!embed) {
        //     img = post.video && post.video.dynamicCover; // dynamic cover (webp)
        // }
        img =
            img ||
            post.video?.cover?.url_list.at(-1) || // HD
            post.video?.origin_cover?.url_list.at(-1); // LD
        img = img && resolveUrl(img);

        // render description
        const desc = post.desc?.replaceAll('\n', '<br>');
        let media = (embed && videoList ? templates.embed : templates.cover)({ img, videoList, duration });
        media = embed && videoList && iframe ? templates.iframe({ content: media }) : media; // warp in iframe
        const description = templates.desc({ desc, media });

        return {
            title: post.desc.split('\n')[0],
            description,
            link: `https://www.douyin.com/video/${post.aweme_id}`,
            pubDate: parseDate(post.create_time * 1000),
            category: post.video_tag.map((t) => t.tag_name),
        };
    });

    return {
        title: userNickName,
        // description: userDescription,
        image: userAvatar,
        link: pageUrl,
        item: items,
    };
}
