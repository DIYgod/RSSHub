import { load } from 'cheerio';

import { config } from '@/config';
import NotFoundError from '@/errors/types/not-found';
import { renderUserEmbed } from '@/routes/tiktok/templates/user';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getPuppeteerPage } from '@/utils/puppeteer';

export const route: Route = {
    path: '/profile/:id/:type?/:functionalFlag?',
    categories: ['social-media'],
    example: '/picuki/profile/linustech',
    parameters: {
        id: 'Tiktok user id (without @)',
        type: {
            description: 'Type of profile page',
            options: [
                {
                    value: 'profile',
                    label: 'Profile Page',
                },
                {
                    value: 'story',
                    label: 'Story Page',
                },
            ],
            default: 'profile',
        },
        functionalFlag: {
            description: 'Functional flag for video embedding',
            options: [
                {
                    value: '0',
                    label: 'Off, only show video poster as an image',
                },
                {
                    value: '1',
                    label: 'On',
                },
            ],
            default: '1',
        },
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
            source: ['www.picuki.com/profile/:id'],
            target: '/profile/:id',
        },
        {
            source: ['www.picuki.com/story/:id'],
            target: '/profile/:id/story',
        },
    ],
    name: 'User Profile - Picuki',
    maintainers: ['hoilc', 'Rongronggg9', 'devinmugen', 'NekoAria'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'profile';
    const functionalFlag = ctx.req.param('functionalFlag') ?? '1';
    const useIframe = functionalFlag !== '0';

    const baseUrl = 'https://www.picuki.com';
    const profileUrl = `${baseUrl}/${type === 'story' ? 'story' : 'profile'}/${id}`;

    const data = (await cache.tryGet(`picuki:${type}:${id}`, async () => {
        let response;
        try {
            response = await ofetch(profileUrl, {
                headers: {
                    'User-Agent': config.trueUA,
                },
            });
        } catch (error) {
            if (error.status === 403) {
                const { page, destory } = await getPuppeteerPage(profileUrl, {
                    onBeforeLoad: async (page) => {
                        const expectResourceTypes = new Set(['document', 'script', 'xhr', 'fetch']);
                        await page.setRequestInterception(true);
                        page.on('request', (request) => {
                            expectResourceTypes.has(request.resourceType()) ? request.continue() : request.abort();
                        });
                    },
                });
                await page.waitForSelector('.content');
                response = await page.content();
                await destory();
            } else {
                throw new NotFoundError(error.message);
            }
        }

        const $ = load(response);

        if ($('.posts-empty').length) {
            throw new Error($('.posts-empty').text().trim() || 'No posts found');
        }
        if ($('.error-p').length) {
            throw new Error($('.error-p span').text().trim() || 'Profile not found');
        }

        const username = $('.profile-info .username').text().trim();

        const items = $('.posts-video .posts__video-item .posts__video-item-a')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const videoId = $item.attr('href')?.split('/').pop();
                const img = $item.find('img');
                return {
                    title: img.attr('alt') || '',
                    author: username,
                    renderData: {
                        poster: img.attr('src'),
                        source: $item.find('.popup-open').data('source'),
                        id: videoId,
                    },
                    link: `${baseUrl}/media/${videoId}`,
                    guid: `https://www.tiktok.com/@${id}/video/${videoId}`,
                };
            });

        return {
            title: $('head title').text(),
            description: $('.posts-current').text().trim(),
            image: $('.profile-image').attr('src'),
            items,
        };
    })) as {
        title: string;
        description: string;
        image: string;
        items: Array<{
            title: string;
            author: string;
            renderData: {
                poster: string;
                source: string;
                id: string;
            };
            link: string;
            guid: string;
        }>;
    };

    const items: DataItem[] = data.items.map((item) => ({
        ...item,
        description: renderUserEmbed({
            poster: item.renderData.poster,
            source: item.renderData.source,
            useIframe,
            id: item.renderData.id,
        }),
    }));

    return {
        title: data.title,
        link: profileUrl,
        image: data.image,
        description: data.description,
        item: items,
    };
}
