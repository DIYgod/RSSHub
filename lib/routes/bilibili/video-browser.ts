import type { Context } from 'hono';

import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import logger from '@/utils/logger';
import { getPuppeteerPage } from '@/utils/puppeteer';

import utils, { getVideoUrl } from './utils';

export const route: Route = {
    path: '/user/video-browser/:uid/:embed?',
    categories: ['social-media'],
    view: ViewType.Videos,
    example: '/bilibili/user/video-browser/2267573',
    parameters: { uid: '用户 id, 可在 UP 主主页中找到', embed: '默认为开启内嵌视频, 任意值为关闭' },
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
            source: ['space.bilibili.com/:uid'],
            target: '/bilibili/user/video-browser/:uid',
        },
    ],
    name: 'UP 主投稿（浏览器模式）',
    maintainers: ['gqy20'],
    handler,
};

interface VideoItem {
    bvid: string;
    title: string;
    pic: string;
    pubDate?: string;
}

function getCookieString(): string {
    const cookieKeys = Object.keys(config.bilibili.cookies);
    if (cookieKeys.length > 0) {
        return config.bilibili.cookies[cookieKeys[0]] || '';
    }
    return process.env.BILIBILI_COOKIE || '';
}

async function fetchVideoListFromPage(uid: string): Promise<{ videos: VideoItem[]; userName: string }> {
    const url = `https://space.bilibili.com/${uid}/video`;
    logger.info(`[bilibili/video-browser] fetching via puppeteer: ${url}`);

    const cookieString = getCookieString();
    if (!cookieString) {
        throw new Error('BILIBILI_COOKIE is not configured');
    }

    const { page, destroy } = await getPuppeteerPage(url, {
        onBeforeLoad: async (page) => {
            // Set all bilibili cookies for authenticated access
            const cookies = cookieString
                .split(';')
                .map((c) => c.trim())
                .filter(Boolean);
            await Promise.all(
                cookies
                    .map((c) => {
                        const eqIdx = c.indexOf('=');
                        if (eqIdx <= 0) {
                            return null;
                        }
                        return page.setCookie({
                            name: c.slice(0, eqIdx).trim(),
                            value: c.slice(eqIdx + 1).trim(),
                            domain: '.bilibili.com',
                            path: '/',
                        });
                    })
                    .filter(Boolean)
            );

            // Block unnecessary resources to speed up loading
            const allowed = new Set(['document', 'script', 'xhr', 'fetch', 'image', 'font', 'stylesheet']);
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                allowed.has(request.resourceType()) ? request.continue() : request.abort();
            });
        },
        gotoConfig: { waitUntil: 'networkidle0' },
    });

    try {
        // Wait for video links to appear in DOM
        try {
            await page.waitForSelector('a[href*="/video/BV"]', { timeout: 15000 });
        } catch {
            // selector may not exist, continue anyway
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Extract video data from DOM using proven approach
        const result = await page.evaluate(() => {
            // Collect all video link candidates grouped by BV
            const bvMap = new Map();
            for (const link of [...document.querySelectorAll('a[href]')]) {
                const m = link.href.match(/\/video\/(BV\w+)/);
                if (!m) {
                    continue;
                }
                const bv = m[1];
                const text = (link.textContent || '').trim().replaceAll(/\s+/g, ' ');
                const hasTitle = !/^\d+$/.test(text) && !/^[\d\s:]+$/.test(text) && text.length > 3;
                if (!bvMap.has(bv)) {
                    bvMap.set(bv, []);
                }
                bvMap.get(bv).push({ text, hasTitle, el: link });
            }

            // For each BV, pick the best candidate (prefer Chinese text, longer titles)
            const videos = [];
            for (const [bv, candidates] of bvMap) {
                let best = candidates[0]?.text || '';
                let bestEl = candidates[0]?.el;
                for (const c of candidates) {
                    if (c.hasTitle && c.text.length > best.length) {
                        best = c.text;
                        bestEl = c.el;
                    }
                    if (/[一-鿿]/.test(c.text) && c.text.length > 5) {
                        best = c.text;
                        bestEl = c.el;
                        break;
                    }
                }
                best = best.replace(/\d+[\s\S]*$/, '').trim();
                if (best.length > 2) {
                    // Find cover image: look for img in parent card or nearby
                    let pic = '';
                    const card = bestEl?.closest('.small-item, .content-item, [class*="video-card"], li');
                    if (card) {
                        const img = card.querySelector('img');
                        if (img) {
                            pic = img.src || img.dataset.src || '';
                        }
                    }
                    // Fallback: find nearest img to this link
                    if (!pic && bestEl) {
                        const parent = bestEl.closest('div') || bestEl.parentElement;
                        if (parent) {
                            const imgs = parent.querySelectorAll('img');
                            for (const im of imgs) {
                                const src = im.src || im.dataset.src || '';
                                if (src && (src.includes('hdslb') || src.includes('bilibili'))) {
                                    pic = src;
                                    break;
                                }
                            }
                        }
                    }
                    videos.push({ bvid: bv, title: best, pic });
                }
            }

            // Get username from page title (format: "DIYgod投稿视频-DIYgod视频分享-哔哩哔哩视频")
            let userName = '';
            const titleMatch = document.title.match(/^(\S+?)投稿视频/);
            if (titleMatch) {
                userName = titleMatch[1];
            }

            // Fallback: try DOM selectors
            if (!userName) {
                const nameEl = document.querySelector('.h-name, .name, [class*="username"], h1');
                if (nameEl) {
                    userName = nameEl.textContent?.trim() || '';
                }
            }

            return { videos, userName };
        });

        logger.info(`[bilibili/video-browser] extracted ${result.videos.length} videos, user: ${result.userName}`);
        return result;
    } finally {
        await destroy();
    }
}

async function handler(ctx: Context) {
    const uid = ctx.req.param('uid');
    const embed = !ctx.req.param('embed');

    const { videos, userName } = await fetchVideoListFromPage(uid);

    const items = videos
        .filter((v) => v.bvid)
        .map((video) => ({
            title: video.title,
            description: utils.renderUGCDescription(embed, video.pic || '', '', 0, undefined, video.bvid),
            pubDate: video.pubDate ? new Date(video.pubDate) : undefined,
            link: `https://www.bilibili.com/video/${video.bvid}`,
            author: userName || uid,
            comments: 0,
            attachments: video.bvid ? [{ url: getVideoUrl(video.bvid), mime_type: 'text/html' as const }] : undefined,
        }));

    return {
        title: `${userName || uid} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${userName || uid} 的 bilibili 空间`,
        item: items,
    };
}
