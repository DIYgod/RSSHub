import { escapeText } from 'entities';
import type { Response } from 'patchright';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import { setCookies } from '@/utils/playwright-utils';

import type { PostData } from './types';
import { resolveUrl, templates } from './utils';

type SavedPostsType = 'likes' | 'collection';

async function settleResponse(responsePromise: Promise<Response>) {
    try {
        return { response: await responsePromise };
    } catch (error) {
        return { error };
    }
}

export async function getSavedPosts(type: SavedPostsType, uid: string) {
    const cookie = config.douyin.cookie;
    if (uid === 'self' && !cookie) {
        throw new ConfigNotFoundError('Set DOUYIN_COOKIE to subscribe to your own liked or collected videos.');
    }

    const link = `https://www.douyin.com/user/${uid}`;
    const apiPath = type === 'likes' ? '/aweme/v1/web/aweme/favorite/' : '/aweme/v1/web/aweme/listcollection/';
    const tabName = type === 'likes' ? /^喜欢(?:\s|$)/ : '收藏';
    const data = await cache.tryGet(
        `douyin:${type}:${uid}:${md5(cookie || 'visitor')}`,
        async () => {
            const { page, destroy } = await getPlaywrightPage(link, {
                noGoto: true,
                closeTimeout: 0,
                onBeforeLoad: async (page) => {
                    if (cookie) {
                        await setCookies(page, cookie, '.douyin.com');
                    }
                    const resourceTypes = new Set(['document', 'script', 'xhr', 'fetch']);
                    await page.route('**/*', (route) => (resourceTypes.has(route.request().resourceType()) ? route.continue() : route.abort()));
                },
            });

            try {
                // Handle a response timeout even if navigation fails before it is awaited.
                const responsePromise = settleResponse(
                    page.waitForResponse((response) => {
                        const url = new URL(response.url());
                        return url.hostname === 'www.douyin.com' && url.pathname === apiPath && response.request().frame() === page.mainFrame() && (uid === 'self' || url.searchParams.get('sec_user_id') === uid);
                    })
                );
                await page.goto(link, { waitUntil: 'domcontentloaded' });
                const tab = page.getByRole('tab', { name: tabName, exact: typeof tabName === 'string' });
                await tab.waitFor();
                if ((await tab.getAttribute('aria-selected')) !== 'true') {
                    await tab.click();
                }
                if (type === 'collection') {
                    const videosTab = page.getByRole('tab', { name: '视频', exact: true });
                    await videosTab.waitFor();
                    if ((await videosTab.getAttribute('aria-selected')) !== 'true') {
                        await videosTab.click();
                    }
                }

                const responseResult = await responsePromise;
                if ('error' in responseResult) {
                    throw new Error(`Unable to retrieve the first ${type} page. Verify DOUYIN_COOKIE and that the list is visible on Douyin.`, { cause: responseResult.error });
                }
                const { response } = responseResult;
                if (!response.ok()) {
                    throw new Error(`Douyin ${type} request failed with HTTP ${response.status()}. Please verify DOUYIN_COOKIE and access to the page.`);
                }
                const posts: PostData = await response.json();
                if (posts.status_code !== 0 || !posts.aweme_list?.length) {
                    throw new Error(`No visible ${type === 'likes' ? 'liked' : 'collected'} videos. Verify that the list is nonempty and visible to the account in DOUYIN_COOKIE.`);
                }

                const nickname = await page.locator('h1').filter({ visible: true }).textContent();
                if (!nickname?.trim()) {
                    throw new Error('The Douyin user profile is unavailable. Verify the user ID and DOUYIN_COOKIE.');
                }
                return { nickname, posts: posts.aweme_list };
            } finally {
                await destroy();
            }
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${data.nickname}${type === 'likes' ? '喜欢' : '收藏'}的视频 - 抖音`,
        link,
        item: renderSavedPosts(data.posts),
    };
}

export function renderSavedPosts(posts: PostData['aweme_list']): DataItem[] {
    return posts.map((post) => {
        const video = post.video;
        const videoList = video?.bit_rate?.map((item) => resolveUrl(item.play_addr.url_list.at(-1))).filter(Boolean) || [];
        if (!videoList.length && video?.play_addr?.url_list.length) {
            videoList.push(resolveUrl(video.play_addr.url_list.at(-1)));
        }
        const img = resolveUrl(video?.cover?.url_list.at(-1) || video?.origin_cover?.url_list.at(-1));
        const desc = escapeText(post.desc || '').replaceAll('\n', '<br>');
        return {
            title: post.desc,
            description: templates.desc({ desc, media: templates.cover({ img, videoList }) }),
            link: `https://www.douyin.com/video/${post.aweme_id}`,
            author: post.author.nickname,
            pubDate: post.create_time ? parseDate(post.create_time, 'X') : undefined,
            category: post.video_tag?.map((tag) => tag.tag_name),
        };
    });
}
