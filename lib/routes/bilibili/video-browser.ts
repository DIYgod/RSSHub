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
        requireConfig: [
            {
                name: 'BILIBILI_COOKIE',
                description: `B 站用户登录后的 Cookie 值，获取方式：
    1.  打开 [https://space.bilibili.com](https://space.bilibili.com) 并登录
    2.  按 F12 打开开发者工具，切换到 Application → Cookies
    3.  复制整段 Cookie 值（包含 SESSDATA 字段即可，但建议完整复制）
    4.  设置为环境变量 \`BILIBILI_COOKIE\` 或在配置文件中填写`,
            },
        ],
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['space.bilibili.com/:uid'],
            target: '/user/video-browser/:uid',
        },
    ],
    name: 'UP 主投稿（浏览器模式）',
    maintainers: ['gqy20'],
    description: `::: warning
  需要 Puppeteer 以及 B 站登录 Cookie，只能自建部署使用。
:::`,
    handler,
};

interface VideoItem {
    bvid: string;
    title: string;
    pic: string;
    description: string;
    pubDate?: number;
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

    let apiData: Record<string, unknown> | null = null;

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

            // Intercept the video list API response — browser calls this automatically
            page.on('response', async (response) => {
                if (!response.url().includes('/x/space/wbi/arc/search')) {
                    return;
                }
                try {
                    apiData = (await response.json()) as Record<string, unknown>;
                } catch {
                    // ignore parse errors
                }
            });
        },
        gotoConfig: { waitUntil: 'networkidle0' },
    });

    try {
        // Wait a bit for the API response to arrive
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (!apiData || (apiData as { code?: number }).code !== 0) {
            throw new Error(`Failed to get video list from API: ${JSON.stringify(apiData)?.slice(0, 200)}`);
        }

        const data = apiData.data as { list?: { vlist?: VideoItem[] }; page?: { count?: number } };
        const vlist = data.list?.vlist || [];

        // Get username from first video's author field or page title
        let userName = vlist.length > 0 ? vlist[0].author : '';
        if (!userName) {
            userName = (await page.evaluate(() => {
                const m = document.title.match(/^(\S+?)投稿视频/);
                return m?.[1] || '';
            })) as string;
        }

        logger.info(`[bilibili/video-browser] extracted ${vlist.length} videos, user: ${userName}`);
        return { videos: vlist, userName };
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
            pubDate: video.pubDate ? new Date(video.pubDate * 1000) : undefined,
            link: `https://www.bilibili.com/video/${video.bvid}`,
            author: userName || uid,
            comments: video.comment || 0,
            attachments: video.bvid ? [{ url: getVideoUrl(video.bvid), mime_type: 'text/html' as const }] : undefined,
        }));

    return {
        title: `${userName || uid} 的 bilibili 空间`,
        link: `https://space.bilibili.com/${uid}`,
        description: `${userName || uid} 的 bilibili 空间`,
        item: items,
    };
}
