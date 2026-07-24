import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import { buildBilibiliArticleFeedItem, parseBilibiliArticlePage } from '@/utils/bilibili-article';
import { parseBilibiliOpusArticle } from '@/utils/bilibili-opus';
import cacheGeneral from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import cache from './cache';

export const route: Route = {
    path: '/user/article/:uid/:loginUid?',
    categories: ['social-media'],
    example: '/bilibili/user/article/334958638',
    parameters: {
        uid: 'UP 主用户 id，可在其主页中找到',
        loginUid: '可选，用于选择 BILIBILI_COOKIE_{loginUid} 对应的登录用户',
    },
    features: {
        requireConfig: [
            {
                name: 'BILIBILI_COOKIE_*',
                optional: true,
                description: '配置 BILIBILI_COOKIE_{loginUid} 后，可在路由末尾传入 loginUid，使用该登录用户已有的访问权限读取其已解锁的图文正文。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['space.bilibili.com/:uid'],
            target: '/user/article/:uid',
        },
    ],
    name: 'UP 主图文',
    maintainers: ['lengthmin', 'Qixingchen', 'hyoban'],
    handler,
    description: '逐篇抓取图文正文。配置 BILIBILI\\_COOKIE\\_{loginUid} 后，可通过 loginUid 参数选择登录用户，并使用该账号已有的访问权限读取其已解锁的充电专属内容。未配置时仅返回公开内容或预览。',
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    const loginUid = ctx.req.param('loginUid');
    const cookie = loginUid ? config.bilibili.cookies[loginUid] : cache.getConfiguredCookie();

    if (loginUid && !cookie) {
        throw new ConfigNotFoundError(`Missing BILIBILI_COOKIE_${loginUid}`);
    }

    const referer = `https://space.bilibili.com/${uid}/article`;
    const headers = {
        Referer: referer,
        'User-Agent': config.ua,
        ...(cookie && { Cookie: cookie }),
    };
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/polymer/web-dynamic/v1/opus/feed/space?host_mid=${uid}`,
        headers,
    });

    if (response.data.code !== 0 || !Array.isArray(response.data.data?.items)) {
        throw new Error(`Failed to fetch Bilibili articles: ${response.data.message || `API code ${response.data.code}`}`);
    }

    const data = response.data.data;
    const link = `https://space.bilibili.com/${uid}/article`;
    const cacheContext = loginUid || 'default';

    const resolvedItems = await Promise.all(
        data.items.map(async (item) => {
            const link = item.jump_url.startsWith('//') ? `https:${item.jump_url}` : item.jump_url;
            let article = {};

            try {
                article = await cacheGeneral.tryGet(`bilibili:article:v4:${item.opus_id}:${cacheContext}`, async () => {
                    const detail = await got({
                        method: 'get',
                        url: `https://api.bilibili.com/x/polymer/web-dynamic/v1/opus/detail?id=${encodeURIComponent(item.opus_id)}`,
                        headers,
                    });
                    const opusArticle = parseBilibiliOpusArticle(detail.data);
                    if (opusArticle.description) {
                        return opusArticle;
                    }

                    const page = await got({
                        method: 'get',
                        url: link,
                        headers,
                    });
                    const pageArticle = parseBilibiliArticlePage(page.data as string);
                    if (!pageArticle.description) {
                        throw new Error(`Bilibili article body is unavailable: ${link}`);
                    }
                    return pageArticle;
                });
            } catch {
                // An authenticated title-only result must not be cached or
                // published. Anonymous routes retain their preview fallback.
            }

            const feedItem = buildBilibiliArticleFeedItem({
                article,
                fallbackTitle: item.content,
                link,
                authenticated: Boolean(cookie),
            });

            if (!feedItem) {
                return;
            }

            return {
                ...feedItem,
                pubDate: feedItem.pubDate ? parseDate(feedItem.pubDate, typeof feedItem.pubDate === 'number' ? 'X' : 'YYYY年MM月DD日 HH:mm') : undefined,
            };
        })
    );
    const item = resolvedItems.filter((item) => item !== undefined);

    if (cookie && item.length === 0) {
        throw new Error('No authenticated Bilibili article bodies were returned. Verify that the configured BILIBILI_COOKIE_* account can access these articles.');
    }

    const name = item.find((article) => article.author)?.author || uid;
    const title = `${name} 的 bilibili 图文`;

    return {
        title,
        link,
        description: title,
        item,
    };
}
