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
        let usePuppeteer = false;
        try {
            const data = await ofetch(profileUrl);
            html = data;
        } catch {
            html = await puppeteerGet(profileUrl, browser);
            usePuppeteer = true;
        }
        const $ = load(html);

        const list = $('.post_box')
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
            });

        const newDescription = await Promise.all(
            list.map((item) =>
                cache.tryGet(`picnob:user:${id}:${item.guid}`, async () => {
                    try {
                        const html = usePuppeteer
                            ? await puppeteerGet(item.link, browser)
                            : await ofetch(item.link, {
                                  headers: {
                                      'user-agent': 'PostmanRuntime/7.44.0',
                                  },
                              });
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
                })
            )
        );

        return {
            title: `${$('h1.fullname').text()} (@${id}) ${type === 'tagged' ? 'tagged' : 'public'} posts - Picnob`,
            description: $('.info .sum').text(),
            link: profileUrl,
            image: $('.ava .pic img').attr('src'),
            item: list.map((item, index) => ({
                ...item,
                description: newDescription[index] || item.description,
            })),
        };
    } catch (error) {
        await browser.close();
        throw error;
    } finally {
        await browser.close();
    }
}
