import { Route, ViewType } from '@/types';

import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';
import { puppeteerGet } from './utils';
import puppeteer from '@/utils/puppeteer';
import sanitizeHtml from 'sanitize-html';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['social-media', 'popular'],
    example: '/picnob/user/xlisa_olivex',
    parameters: {
        id: 'Instagram id',
        type: 'Type of profile page (profile or tagged)',
    },
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
            source: ['www.pixnoy.com/profile/:id'],
            target: '/user/:id',
        },
        {
            source: ['www.pixnoy.com/profile/:id/tagged'],
            target: '/user/:id/tagged',
        },
    ],
    name: 'User Profile - Picnob',
    maintainers: ['TonyRL', 'micheal-death', 'AiraNadih', 'DIYgod'],
    handler,
    view: ViewType.Pictures,
};

async function handler(ctx) {
    // NOTE: 'picnob' is still available, but all requests to 'picnob' will be redirected to 'pixnoy' eventually
    const baseUrl = 'https://www.pixnoy.com';
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'profile';
    const profileUrl = `${baseUrl}/profile/${id}/${type === 'tagged' ? 'tagged/' : ''}`;

    const browser = await puppeteer();
    // TODO: can't bypass cloudflare 403 error without puppeteer

    try {
        let html;
        try {
            const data = await ofetch(profileUrl);
            html = data;
        } catch {
            html = await puppeteerGet(profileUrl, browser);
        }
        const $ = load(html);
        const name = $('h1.fullname').text();

        const profile = {
            name,
            description: $('.info .sum').text(),
            image: $('.ava .pic img').attr('src'),
            items: $('.post_box')
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    const sum = $item.find('.sum').text();
                    const coverLink = $item.find('.cover_link').attr('href');
                    const shortcode = coverLink?.split('/')?.[2];

                    return {
                        title: sanitizeHtml(sum.split('\n')[0], { allowedTags: [], allowedAttributes: {} }),
                        description: `<img src="${$item.find('.preview_w img').attr('data-src')}" /><br />${sum.replaceAll('\n', '<br>')}`,
                        link: `${baseUrl}${coverLink}`,
                        guid: shortcode,
                        pubDate: parseRelativeDate($item.find('.time .txt').text()),
                    };
                }),
        };

        const profileTitle = type === 'tagged' ? `${profile.name} (@${id}) tagged posts - Picnob` : `${profile.name} (@${id}) public posts - Picnob`;

        for (const item of profile.items) {
            // eslint-disable-next-line no-await-in-loop
            const newDescription = (await cache.tryGet(`picnob:user:${id}:${item.guid}`, async () => {
                try {
                    let html;
                    try {
                        const data = await ofetch(item.link);
                        html = data;
                    } catch {
                        html = await puppeteerGet(item.link, browser);
                    }
                    const $ = load(html);
                    if ($('.video_img').length > 0) {
                        return `<video src="${$('.video_img a').attr('href')}" poster="${$('.video_img img').attr('data-src')}"></video><br />${$('.sum_full').text()}`;
                    } else {
                        let description = '';
                        for (const slide of $('.swiper-slide').toArray()) {
                            const $slide = $(slide);
                            description += `<img src="${$slide.find('.pic img').attr('data-src')}" /><br />`;
                        }
                        description += $('.sum_full').text();
                        return description;
                    }
                } catch {
                    return '';
                }
            })) as string;
            if (newDescription) {
                item.description = newDescription;
            }
        }

        return {
            title: profileTitle,
            description: profile.description,
            link: profileUrl,
            image: profile.image,
            item: profile.items,
        };
    } catch (error) {
        await browser.close();
        throw error;
    } finally {
        await browser.close();
    }
}
