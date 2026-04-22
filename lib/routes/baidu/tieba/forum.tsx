import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import timezone from '@/utils/timezone';

import { getTiebaPageContent, normalizeUrl } from './common';
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
    const sortParam = sortBy === 'replied' ? '&sc=67108864' : '';

    const pageUrl = `https://tieba.baidu.com/f?kw=${encodeURIComponent(kw)}&pn=0${cid === '0' ? '' : `&cid=${cid}`}${ctx.req.path.includes('good') ? '&tab=good' : ''}${sortParam}`;
    const data = await getTiebaPageContent(pageUrl, `tieba:forum:${kw}:${cid}:${sortBy}`, { waitForSelector: '.thread-card-wrapper', timeout: 3000 });

    const $ = load(data);
    const threadListHTML = $('code[id="pagelet_html_frs-list/pagelet/thread_list"]')
        .contents()
        .filter((_, e) => e.type === 'comment' || (e as { nodeType?: number }).nodeType === 8)
        .first()
        .text()
        .trim();

    const threadRoot = threadListHTML ? load(threadListHTML) : $;
    const allThreads = parseThreads(threadRoot);

    if (allThreads.length === 0) {
        throw new Error('No threads found. The cookie may be expired or invalid. Please check your BAIDU_COOKIE.');
    }

    const list = allThreads.map((thread) => {
        const parsedDate = thread.time ? parseRelativeTime(thread.time) : undefined;
        const pubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? timezone(parsedDate, +8) : undefined;
        return {
            title: thread.title,
            link: normalizeUrl(thread.link) || `https://tieba.baidu.com/p/${thread.id}`,
            ...(pubDate ? { pubDate } : {}),
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
