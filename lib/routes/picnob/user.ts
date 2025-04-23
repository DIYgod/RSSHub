import { Route, ViewType } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import { puppeteerGet } from './utils';
import puppeteer from '@/utils/puppeteer';
import sanitizeHtml from 'sanitize-html';

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
            source: ['pixwox.com/profile/:id'],
            target: '/user/:id',
        },
        {
            source: ['pixwox.com/profile/:id/tagged'],
            target: '/user/:id/tagged',
        },
    ],
    name: 'User Profile - Picnob',
    maintainers: ['TonyRL', 'micheal-death', 'AiraNadih'],
    handler,
    view: ViewType.Pictures,
};

async function handler(ctx) {
    // NOTE: 'picnob' is still available, but all requests to 'picnob' will be redirected to 'pixwox' eventually
    const baseUrl = 'https://www.pixwox.com';
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'profile';
    const profileUrl = `${baseUrl}/profile/${id}/${type === 'tagged' ? 'tagged/' : ''}`;

    const browser = await puppeteer();
    // TODO: can't bypass cloudflare 403 error without puppeteer
    try {
        const profile = (await cache.tryGet(`picnob:user:${id}`, async () => {
            let html;
            let usePuppeteer = false;
            try {
                const data = await ofetch(profileUrl, {
                    headers: {
                        accept: 'text/html',
                        referer: 'https://www.google.com/',
                    },
                });
                html = data;
            } catch {
                html = await puppeteerGet(profileUrl, browser);
                usePuppeteer = true;
            }
            const $ = load(html);
            const name = $('h1.fullname').text();
            const userId = $('input[name=userid]').attr('value');

            if (!userId) {
                throw new Error('Failed to get user ID');
            }

            return {
                name,
                userId,
                description: $('.info .sum').text(),
                image: $('.ava .pic img').attr('src'),
                usePuppeteer,
            };
        })) as {
            name: string;
            userId: string;
            description: string;
            image: string;
            usePuppeteer: boolean;
        };

        let profileTitle;
        let endpoint;
        if (type === 'tagged') {
            profileTitle = `${profile.name} (@${id}) tagged posts - Picnob`;
            endpoint = 'tagged';
        } else {
            profileTitle = `${profile.name} (@${id}) public posts - Picnob`;
            endpoint = 'posts';
        }

        const apiUrl = `${baseUrl}/api/${endpoint}`;

        let responseData;
        try {
            if (profile.usePuppeteer) {
                responseData = await puppeteerGet(`${apiUrl}?userid=${profile.userId}`, browser);
                responseData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
            } else {
                const data = await ofetch(apiUrl, {
                    headers: {
                        accept: 'application/json',
                    },
                    query: {
                        userid: profile.userId,
                    },
                });
                responseData = typeof data === 'string' ? JSON.parse(data) : data;
            }
        } catch {
            responseData = await puppeteerGet(`${apiUrl}?userid=${profile.userId}`, browser);
            responseData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
        }

        const posts = responseData?.posts;

        if (!posts?.items?.length) {
            throw new Error('No posts found');
        }

        if (type === 'tagged') {
            posts.items = posts.items.map((post, index) => {
                const taggedPost = responseData.tagged.items[index] || {};
                return { ...taggedPost, ...post };
            });
        }

        const list = await Promise.all(
            posts.items.map(async (item) => {
                const { shortcode, sum, sum_pure, type, time } = item;

                const link = `${baseUrl}/post/${shortcode}/`;
                if (type === 'img_multi') {
                    item.images = await cache.tryGet(link, async () => {
                        let html;
                        if (profile.usePuppeteer) {
                            html = await puppeteerGet(link, browser);
                        } else {
                            const data = await ofetch(link);
                            html = data;
                        }
                        const $ = load(html);
                        return [
                            ...new Set(
                                $('.post_slide a')
                                    .toArray()
                                    .map((a: any) => {
                                        a = $(a);
                                        return {
                                            ori: a.attr('href'),
                                            url: a.find('img').attr('data-src'),
                                            isVideo: !!a.find('.icon_play').length,
                                        };
                                    })
                            ),
                        ];
                    });
                }

                return {
                    title: sanitizeHtml(sum.split('\n')[0], { allowedTags: [], allowedAttributes: {} }) || sum_pure,
                    description: art(path.join(__dirname, 'templates/desc.art'), {
                        item: {
                            ...item,
                            // Fix linebreaks
                            sum: sum.replaceAll('\n', '<br>'),
                        },
                    }),
                    link,
                    guid: shortcode,
                    pubDate: parseDate(time, 'X'),
                };
            })
        );

        return {
            title: profileTitle,
            description: profile.description,
            link: profileUrl,
            image: profile.image,
            item: list,
        };
    } catch (error) {
        await browser.close();
        throw error;
    } finally {
        await browser.close();
    }
}
