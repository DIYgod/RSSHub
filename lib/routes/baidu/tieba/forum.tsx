import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import timezone from '@/utils/timezone';

import { getTiebaForumData } from './common';

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
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '精品帖子',
    maintainers: ['u3u', 'FlanChanXwO'],
    handler,
};

function extractContent(items: any[]): { text: string; images: string[] } {
    let text = '';
    const images: string[] = [];
    if (!Array.isArray(items)) {
        return { text, images };
    }
    for (const item of items) {
        if (Number(item.type) === 0 && item.text) {
            text += item.text;
        } else if (Number(item.type) === 3) {
            const src = item.origin_src || item.original_src || item.big_cdn_src || item.cdn_src || item.src;
            if (src) {
                images.push(src);
            }
        }
    }
    return { text, images };
}

async function handler(ctx) {
    const { kw, cid = '0', sortBy = 'created' } = ctx.req.param();
    const isGood = ctx.req.path.includes('good');

    const data = await getTiebaForumData({ kw, cid, isGood, sortBy });

    if (data?.error_code && data.error_code !== '0' && data.error_code !== 0) {
        throw new Error(`Tieba API error: ${data.error_msg || data.error_code}`);
    }

    const threadList = data?.thread_list || [];

    if (threadList.length === 0) {
        throw new Error('No threads found. The cookie may be expired or invalid. Please check your BAIDU_COOKIE.');
    }

    // Build author map from user_list
    const userList: any[] = data?.user_list || [];
    const authorMap = new Map<number, string>();
    for (const user of userList) {
        if (user.id) {
            authorMap.set(Number(user.id), user.name_show || user.name || '');
        }
    }

    const list = threadList.map((thread) => {
        // Prefer first_post_content (richer), fall back to abstract
        const { text: content, images } = extractContent(thread.first_post_content || thread.abstract || []);

        const timestamp = Number(thread.create_time || 0);
        const pubDate = timestamp > 0 ? timezone(new Date(timestamp * 1000), +8) : undefined;

        const authorName = authorMap.get(Number(thread.author_id)) || '';

        return {
            title: thread.title,
            link: `https://tieba.baidu.com/p/${thread.id || thread.tid}`,
            ...(pubDate ? { pubDate } : {}),
            author: authorName,
            description: renderToString(
                <>
                    {content ? <p>{content}</p> : null}
                    {images.length > 0 ? (
                        <div>
                            {images.map((img) => (
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
