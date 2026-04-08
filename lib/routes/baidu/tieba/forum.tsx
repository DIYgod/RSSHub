import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

import { parseRelativeTime, parseThreads } from './utils';

export const route: Route = {
    path: ['/tieba/forum/good/:kw/:cid?/:sortBy?', '/tieba/forum/:kw/:sortBy?'],
    categories: ['bbs'],
    example: '/baidu/tieba/forum/good/女图',
    parameters: { kw: '吧名', cid: '精品分类，默认为 `0`（全部分类），如果不传 `cid` 则获取全部分类', sortBy: '排序方式：`created`, `replied`。默认为 `created`' },
    features: {
        requireConfig: [
            {
                name: 'BAIDU_COOKIE',
                optional: false,
                description: '百度 cookie 值，用于需要登录的贴吧页面',
            },
        ],
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '精品帖子',
    maintainers: ['u3u', 'FlanChanXwO'],
    handler,
};

async function handler(ctx) {
    // sortBy: created, replied
    const { kw, cid = '0', sortBy = 'created' } = ctx.req.param();
    const cookie = config.baidu.cookie;

    if (!cookie) {
        throw new ConfigNotFoundError('Baidu Tieba RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#baidu">BAIDU_COOKIE</a>');
    }

    // 检查Cookie是否包含必要的BDUSS
    if (!cookie.includes('BDUSS')) {
        throw new Error('BAIDU_COOKIE must contain BDUSS. Please check your cookie format.');
    }

    // 固定抓取3页，约30条帖子
    const maxPages = 3;
    let allThreads: any[] = [];

    // 先获取第一页
    const { getPuppeteerPage } = await import('@/utils/puppeteer');
    const sortParam = sortBy === 'replied' ? '&sc=67108864' : '';

    // 并发获取所有页面
    const pagePromises = [];
    for (let pageNum = 0; pageNum < maxPages; pageNum++) {
        const pageUrl = `https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}&pn=${pageNum * 50}${cid === '0' ? '' : `&cid=${cid}`}${ctx.req.path.includes('good') ? '&tab=good' : ''}${pageNum === 0 ? '' : '&ie=utf-8'}${sortParam}`;

        const promise = cache.tryGet(
            `tieba:forum:${kw}:${cid}:${sortBy}:page${pageNum}`,
            async () => {
                const { page, destroy } = await getPuppeteerPage(pageUrl, {
                    noGoto: true,
                });

                try {
                    await page.goto('https://tieba.baidu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

                    const cookies = cookie.split(';').map((c) => {
                        const [name, value] = c.trim().split('=');
                        return {
                            name: name.trim(),
                            value: value || '',
                            domain: '.tieba.baidu.com',
                        };
                    });
                    await page.setCookie(...cookies);

                    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

                    // 动态等待帖子卡片加载，最多3秒
                    try {
                        await page.waitForSelector('.thread-card-wrapper', { timeout: 3000 });
                    } catch {
                        // 如果3秒内没加载出来，继续执行
                    }

                    const html = await page.content();
                    return html;
                } finally {
                    await destroy();
                }
            },
            config.cache.routeExpire,
            false
        );
        pagePromises.push(promise);
    }

    // 等待所有页面获取完成
    const pageResults = await Promise.all(pagePromises);

    // 解析所有页面数据并去重
    const threadMap = new Map();
    for (const pageData of pageResults) {
        if (pageData && typeof pageData === 'string') {
            const $ = load(pageData);
            const threads = parseThreads($);
            for (const thread of threads) {
                // 使用帖子ID去重，只保留第一次出现的
                if (!threadMap.has(thread.id)) {
                    threadMap.set(thread.id, thread);
                }
            }
        }
    }

    allThreads = [...threadMap.values()];

    if (allThreads.length === 0) {
        throw new Error('No threads found. The cookie may be expired or invalid. Please check your BAIDU_COOKIE.');
    }

    const list = allThreads.map((thread) => {
        const parsedDate = parseRelativeTime(thread.time);
        return {
            title: thread.title,
            link: thread.link || `https://tieba.baidu.com/p/${thread.id}`,
            pubDate: parsedDate ? timezone(parsedDate, +8) : undefined,
            author: thread.author,
            description: renderToString(
                <>
                    {thread.content ? <p>{thread.content}</p> : null}
                    {thread.images && thread.images.length > 0 ? (
                        <div>
                            {thread.images.map((img) => (
                                <img src={img} alt="" style={{ maxWidth: '100%', margin: '5px 0' }} />
                            ))}
                        </div>
                    ) : null}
                </>
            ),
        };
    });

    return {
        title: `${kw}吧`,
        link: `https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}`,
        item: list,
    };
}
