import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseRelativeDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['social-media'],
    example: '/picnob/user/xlisa_olivex',
    parameters: {
        id: 'Instagram id',
        type: 'Type of profile page (profile or tagged)',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.picnob.com/profile/:id'],
            target: '/user/:id',
        },
        {
            source: ['www.picnob.com/profile/:id/tagged'],
            target: '/user/:id/tagged',
        },
    ],
    name: 'User Profile - Picnob',
    maintainers: ['TonyRL', 'micheal-death', 'AiraNadih', 'DIYgod', 'hyoban', 'Rongronggg9'],
    handler,
    view: ViewType.Pictures,
};

async function handler(ctx) {
    const baseUrl = 'https://www.picnob.com';
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'profile';
    const profileUrl = `${baseUrl}/profile/${id}/${type === 'tagged' ? 'tagged/' : ''}`;

    const context = await playwright();

    const page = await context.newPage();
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' ? route.continue() : route.abort();
    });

    await page.goto(profileUrl, {
        waitUntil: 'domcontentloaded',
    });
    logger.http(`Requesting ${profileUrl}`);
    const html = await page.content();
    const $ = load(html);

    const list = $('.post_box')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const coverLink = $item.find('.cover_link').attr('href');
            const image = $item.find('.cover .cover_link img');
            const alt = image.attr('alt') || '';
            const sum = $item.find('.sum');
            const title = sum.text().split('\n', 1)[0] || alt;
            const content = sum.html()?.replaceAll('\n', '<br>') || alt;

            return {
                title,
                // Grid thumbnail is square-cropped (stp=c…a_…s640x640); used only as a fallback if the
                // detail fetch below fails. On success it's swapped for the post's native-aspect image.
                description: `<img src="${image.attr('data-src')}"><br>${content}`,
                link: `${baseUrl}${coverLink}`,
                guid: coverLink?.split('/', 3)?.[2],
                pubDate: parseRelativeDate($item.find('.time .txt').text()),
                slideOrVideo: $item.find('.corner').length,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            // Always fetch the post detail page — the profile grid only exposes square-cropped
            // thumbnails, and its `.corner` badge (slideOrVideo) is unreliable (single photos and many
            // videos are never badged), so gating on it left most posts square. Cached per post link.
            cache.tryGet(item.link, async () => {
                const page = await context.newPage();
                await page.route('**/*', (route) => {
                    const request = route.request();
                    request.resourceType() === 'document' ? route.continue() : route.abort();
                });

                try {
                    await page.goto(item.link, {
                        waitUntil: 'domcontentloaded',
                    });
                    logger.http(`Requesting ${item.link}`);
                    const html = await page.content();
                    const $ = load(html);

                    if ($('.slide-item').length) {
                        // Carousel: prepend every slide's native-aspect image/video (unchanged behaviour).
                        const media = $('.slide-item div:first-of-type')
                            .toArray()
                            .map((slide) => {
                                const $slide = $(slide);
                                // Detect video by element presence — the slide wrapper is `.entry-body`, not
                                // `.video`, so a class check misses it. Emit the native-aspect poster as an <img>
                                // so downstream image extraction (which only reads <img>) still gets a frame.
                                const video = $slide.find('video');
                                if (video.length) {
                                    const poster = video.attr('poster') || '';
                                    return (poster ? `<img src="${poster}">` : '') + (video.prop('outerHTML') || '');
                                }
                                // image slide
                                $slide.find('img').attr('src', $slide.find('img').attr('data-src'));
                                $slide.find('img').removeAttr('data-src');
                                return $slide.html() || '';
                            })
                            .join('');
                        item.description = `${media}<br>${item.description}`;
                    } else if ($('.view video').length) {
                        // Single video: use the native-aspect poster as the leading image, keep the
                        // <video> element so downstream can still detect it's a video post.
                        const poster = $('.view video').attr('poster') || '';
                        const videoHtml = $('.view .video').html() || '';
                        if (poster) {
                            item.description = item.description.replace(/<img\b[^>]*>/, `<img src="${poster}">${videoHtml}`);
                        }
                    } else if ($('.view img').length) {
                        // Single photo: swap the square grid thumbnail for the detail page's native-aspect image.
                        const $img = $('.view img').first();
                        const full = $img.attr('data-src') || $img.attr('src');
                        if (full) {
                            item.description = item.description.replace(/<img\b[^>]*>/, `<img src="${full}">`);
                        }
                    }
                } catch (error) {
                    // Detail fetch failed — keep the square grid thumbnail fallback rather than dropping the post.
                    logger.warn(`picnob: failed to fetch post detail ${item.link}: ${error}`);
                } finally {
                    await page.close();
                }

                return item;
            })
        )
    );

    await context.close();

    return {
        title: `${$('h1.fullname').text()} (@${id}) ${type === 'tagged' ? 'tagged' : 'public'} posts - Picnob`,
        description: $('.info .sum').text(),
        link: profileUrl,
        image: $('.ava .pic img').attr('src'),
        item: items,
    };
}
