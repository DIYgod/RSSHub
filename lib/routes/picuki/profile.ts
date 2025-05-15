import { DataItem, Route } from '@/types';

import cache from '@/utils/cache';
import { load } from 'cheerio';
import * as chrono from 'chrono-node';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import { puppeteerGet } from './utils';
import puppeteer from '@/utils/puppeteer';

function deVideo(media) {
    const $ = load(media);
    let media_deVideo = '';
    $('img,video').each((_, medium) => {
        const tag = medium.name;
        const mediumElement = $(medium);
        const poster = mediumElement.attr('poster');
        // 如果有 poster 属性，表明它是视频，将它替换为它的 poster；如果不是，就原样返回
        media_deVideo += (() => {
            if (poster) {
                return `<img src='${poster}' alt='video poster'>`;
            } else if (tag === 'img') {
                return mediumElement.toString();
            } else {
                return '';
            }
        })();
    });
    return media_deVideo;
}

export const route: Route = {
    path: '/profile/:id/:type?/:functionalFlag?',
    categories: ['social-media'],
    example: '/picuki/profile/stefaniejoosten',
    parameters: {
        id: 'Instagram user id',
        type: 'Type of profile page (profile or tagged)',
        functionalFlag: `functional flag, see the table below
| functionalFlag | Video embedding                         | Fetching Instagram Stories |
| -------------- | --------------------------------------- | -------------------------- |
| 0              | off, only show video poster as an image | off                        |
| 1 (default)    | on                                      | off                        |
| 10             | on                                      | on                         |
`,
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.picuki.com/profile/:id'],
            target: '/profile/:id',
        },
        {
            source: ['www.picuki.com/profile-tagged/:id'],
            target: '/profile/:id/tagged',
        },
    ],
    name: 'User Profile - Picuki',
    maintainers: ['hoilc', 'Rongronggg9', 'devinmugen', 'NekoAria'],
    handler,
    description: `
::: warning
  Instagram Stories do not have a reliable guid. It is possible that your RSS reader show the same story more than once.
  Though, every Story expires after 24 hours, so it may be not so serious.
:::`,
};

async function handler(ctx) {
    // use Puppeteer due to the obstacle by cloudflare challenge
    const browser = await puppeteer();

    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'profile';
    const functionalFlag = ctx.req.param('functionalFlag') ?? '1';
    const displayVideo = functionalFlag !== '0';
    const includeStories = functionalFlag === '10';

    const profileUrl = `https://www.picuki.com/${type === 'tagged' ? 'profile-tagged' : 'profile'}/${id}`;

    const key = `picuki-${id}-${type}-${includeStories}`;
    const data = await cache.tryGet(key, () => puppeteerGet(profileUrl, browser, includeStories), config.cache.routeExpire, false);
    const $ = load(data);

    const profileName = $('.profile-name-bottom').text();
    const profileTitle = type === 'tagged' ? `${profileName} (@${id}) tagged posts - Picuki` : `${profileName} (@${id}) public posts - Picuki`;
    const profileImg = $('.profile-avatar > img').attr('src');
    const profileDescription = $('.profile-description').text();

    const list = $('ul.box-photos [data-s="media"]').toArray();

    let items: DataItem[] = [];

    let description: string;

    if (includeStories) {
        const stories_wrapper = $('.stories_wrapper');
        if (stories_wrapper.length) {
            const storyItems = $(stories_wrapper)
                .find('.item')
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    const titleElement = $item.find('.stories_count');
                    const title = titleElement.length ? titleElement.text() : '';
                    const pubDate = chrono.parseDate(title) || new Date();
                    const postBox = $item.find('.launchLightbox');
                    const poster = postBox.attr('data-video-poster');
                    const href = postBox.attr('href');
                    const type = postBox.attr('data-post-type'); // video / image
                    const origin = postBox.attr('data-origin');
                    const storiesBackground = $item.find('.stories_background');
                    const storiesBackgroundUrl = storiesBackground?.css('background-image')?.match(/url\('?(.*)'?\)/);
                    const storiesBackgroundUrlSrc = storiesBackgroundUrl?.[1];
                    if (type === 'video') {
                        description = art(path.join(__dirname, 'templates/video.art'), {
                            videoSrcs: [href, origin].filter(Boolean),
                            videoPoster: poster ?? storiesBackgroundUrlSrc ?? '',
                        });
                    } else if (type === 'image') {
                        description = `<img src="${href ?? poster ?? storiesBackgroundUrlSrc ?? ''}" alt="Instagram Story">`;
                    }

                    return {
                        title: title ? `Instagram Story: ${title}` : 'Instagram Story',
                        author: `@${id}`,
                        description,
                        link: href,
                        pubDate,
                    };
                });
            if (storyItems.length) {
                items = storyItems;
            }
        }
    }

    async function getMedia(url) {
        const getPost = () => puppeteerGet(url, browser);
        let data = await cache.tryGet(url, getPost);
        if (Object.prototype.toString.call(data) === '[object Object]') {
            // oops, it's a json, maybe it's an old cache from the old version of this route!
            data = await getPost();
            // re-cache it
            await cache.set(url, data);
        }
        const $ = load(data);
        // Instagram 允许最多 10 条图片/视频任意混合于一条 post，picuki 在所有情况下都会将它（们）置于 .single-photo 内
        let html = '';
        $('.single-photo img').each((_, item) => {
            html += $(item).toString();
        });
        $('.single-photo video').each((_, element) => {
            const item = $(element);
            let videoSrc = item.attr('src');
            if (videoSrc === undefined) {
                videoSrc = item.children().attr('src');
            }
            const videoPoster = item.attr('poster');
            let origin = item.parent().attr('onclick');
            if (origin) {
                const regex = /window\.open\('([^']*)'/;
                const match = regex.exec(origin);
                origin = match?.[1];
            }
            html += art(path.join(__dirname, 'templates/video.art'), {
                videoSrcs: [videoSrc, origin].filter(Boolean),
                videoPoster,
            });
        });
        return html;
    }

    items = [
        ...items,
        ...(await Promise.all(
            list.map(async (item) => {
                const post = $(item);

                const postLink = post.find('.photo > a').attr('href');
                const postTime = post.find('.time');
                const pubDate = postTime?.text() ? (chrono.parseDate(postTime.text()) ?? new Date()) : new Date();
                const media_displayVideo = await getMedia(postLink);
                const postText = post
                    .find('.photo-action-description')
                    .text()
                    .trim()
                    .replaceAll(/[^\S\n]+/g, ' ')
                    .replaceAll(/((?<=\n|^)[^\S\n])|([^\S\n](?=\n|$))/g, '');
                const title = postText.replaceAll('\n', ' ') || 'Untitled';
                const description = art(path.join(__dirname, 'templates/post.art'), {
                    media: displayVideo ? media_displayVideo : deVideo(media_displayVideo),
                    desc: postText,
                    locationLink: post.find('.photo-location .icon-globe-alt a'),
                });

                return {
                    title,
                    author: `@${id}`,
                    description,
                    link: postLink,
                    pubDate,
                };
            })
        )),
    ];

    await browser.close();

    return {
        title: profileTitle,
        link: profileUrl,
        image: profileImg,
        description: profileDescription,
        item: items,
    };
}
