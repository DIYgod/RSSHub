// @ts-nocheck
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import { config } from '@/config';
import { fallback, queryToBoolean } from '@/utils/readable-social';
const { templates, resolveUrl, proxyVideo, getOriginAvatar } = require('./utils');
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const cid = ctx.req.param('cid');
    if (isNaN(cid)) {
        throw new TypeError('Invalid tag ID. Tag ID should be a number.');
    }
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const embed = fallback(undefined, queryToBoolean(routeParams.embed), false); // embed video
    const iframe = fallback(undefined, queryToBoolean(routeParams.iframe), false); // embed video in iframe
    const relay = resolveUrl(routeParams.relay, true, true); // embed video behind a reverse proxy

    const tagUrl = `https://www.douyin.com/hashtag/${cid}`;

    const tagData = await cache.tryGet(
        `douyin:hashtag:${cid}`,
        async () => {
            const browser = await puppeteer();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            let awemeList = '';
            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
            });
            page.on('response', async (response) => {
                const request = response.request();
                if (request.url().includes('/v1/web/challenge/aweme')) {
                    awemeList = await response.json();
                }
            });
            await page.goto(tagUrl, {
                waitUntil: 'networkidle2',
            });
            await page.waitForSelector('#RENDER_DATA');
            const html = await page.evaluate(() => document.querySelector('#RENDER_DATA').textContent);
            await browser.close();

            const renderData = JSON.parse(decodeURIComponent(html));
            const dataKey = Object.keys(renderData).find((key) => renderData[key].topicDetail);
            renderData[dataKey].defaultData = awemeList.aweme_list;
            return renderData[dataKey];
        },
        config.cache.routeExpire,
        false
    );

    const tagInfo = tagData.topicDetail;
    const tagName = tagInfo.chaName;
    const userAvatar = getOriginAvatar(tagInfo.hashtagProfile);

    const posts = tagData.defaultData;
    const items = posts.map((post) => {
        // parse video
        let videoList = post.video && post.video.bit_rate && post.video.bit_rate.map((bit_rate) => resolveUrl(bit_rate.play_addr.url_list[0]));
        if (relay) {
            videoList = videoList.map((item) => proxyVideo(item, relay));
        }
        let duration = post.video && post.video.duration;
        duration = duration && duration / 1000;
        let img;
        // if (!embed) {
        //     img = post.video && post.video.dynamic_cover && post.video.dynamic_cover.url_list[post.video.dynamic_cover.url_list.length - 1]; // dynamic cover (webp)
        // }
        img = img || (post.video && post.video.origin_cover && post.video.origin_cover.url_list.at(-1));
        img = img && resolveUrl(img);

        // render description
        const desc = post.desc && post.desc.replaceAll('\n', '<br>');
        let media = art(embed && videoList ? templates.embed : templates.cover, { img, videoList, duration });
        media = embed && videoList && iframe ? art(templates.iframe, { content: media }) : media; // warp in iframe
        const description = art(templates.desc, { desc, media });

        return {
            title: post.desc,
            description,
            link: `https://www.douyin.com/video/${post.aweme_id}`,
            pubDate: parseDate(post.create_time, 'X'),
            category: post.text_extra.map((extra) => extra.hashtag_name),
            author: post.author.nickname,
        };
    });

    ctx.set('data', {
        title: tagName,
        description: `${tagInfo.viewCount} 次播放`,
        image: userAvatar,
        link: tagUrl,
        item: items,
    });
};
