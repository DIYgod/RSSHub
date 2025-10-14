// lib/routes/resetera/thread.ts
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

const BASE = 'https://www.resetera.com';

const absolutize = (u?: string, root = BASE) => {
    if (!u) {
        return u;
    }
    if (u.startsWith('#')) {
        return root + u;
    }
    if (u.startsWith('//')) {
        return 'https:' + u;
    }
    if (u.startsWith('/')) {
        return BASE + u;
    }
    return u;
};

// 提取 post-XXXX 楼层 id，便于排序/去重
const getPostId = (link?: string) => Number(link?.match(/post-(\d+)/)?.[1] || 0);

// 从 srcset 中挑第一张 URL
const pickFromSrcset = (v?: string) =>
    v
        ? v
              .split(',')
              .map((s) => s.trim().split(' ')[0])
              .find(Boolean)
        : undefined;

const handler: Route['handler'] = async (ctx) => {
    const { id } = ctx.req.param(); // 例如 1076160
    const threadRoot = `${BASE}/threads/${id}/`;

    // 1) 抓首页，解析“最后一页”（扫描所有分页链接取最大）
    const firstHtml = await ofetch<string>(threadRoot);
    const $ = load(firstHtml);

    let lastPage = 1;
    $('a[href*="page-"]').each((_, a) => {
        const h = $(a).attr('href') || '';
        const m = h.match(/page-(\d+)/);
        if (m) {
            lastPage = Math.max(lastPage, Number(m[1]));
        }
    });

    // 最新页 URL
    const targetUrl = lastPage === 1 ? threadRoot : `${threadRoot}page-${lastPage}`;

    // 2) 抓取倒数第 1、2 页并合并（首页已抓过，避免重复请求）
    const pages = lastPage > 1 ? [lastPage - 1, lastPage] : [1];
    const htmlMap = new Map<number, string>([[1, firstHtml]]);
    const htmlList = await Promise.all(
        pages.map(async (p) => {
            if (htmlMap.has(p)) {
                return htmlMap.get(p)!;
            }
            const html = await ofetch<string>(p === 1 ? threadRoot : `${threadRoot}page-${p}`);
            htmlMap.set(p, html);
            return html;
        })
    );

    // 3) 解析两页帖子，去重
    const seen = new Set<string>();
    const items = htmlList.flatMap((html) => {
        const $$ = load(html);
        return $$('article.message')
            .toArray()
            .map((el) => {
                const $el = $$(el);

                // 作者
                const author = $el.find('.message-author, .username, .message-name a, [itemprop="name"]').first().text().trim() || '';

                // 楼层直达链接（永久链接）
                const perma = $el.find('.message-attribution-opposite a[href*="/post-"]').last().attr('href') || $el.find('a[href*="#post"]').last().attr('href') || '';
                const link = perma ? absolutize(perma, threadRoot) : targetUrl;
                if (!link || seen.has(link)) {
                    return null;
                }
                seen.add(link);

                // 时间
                const timeEl = $el.find('time').first();
                const dataTime = Number(timeEl.attr('data-time') || 0);
                const pubDate = timeEl.attr('datetime') || (dataTime ? new Date(dataTime * 1000).toUTCString() : undefined);

                // 正文容器（clone 后处理）
                const $body = $el.find('.message-body .bbWrapper, .message-content .bbWrapper, .bbWrapper').first().clone();

                // 去掉引用块（回复别人的引用）
                $body.find('.bbCodeBlock--quote, blockquote.bbCodeBlock').remove();
                // 展开剧透（移除标题，保留内容）
                $body.find('.bbCodeBlock--spoiler .bbCodeBlock-title').remove();

                // 收集图片（在去引用之后统计，避免“只有引用里有图”也被当作图帖）
                const imgs = $body
                    .find('img, picture source')
                    .toArray()
                    .map((node) => {
                        const $n = $$(node);
                        const src = $n.attr('src') || $n.attr('data-src') || $n.attr('data-original') || $n.attr('data-url') || pickFromSrcset($n.attr('srcset')) || pickFromSrcset($n.attr('data-srcset'));
                        return absolutize(src || '', threadRoot);
                    })
                    .filter((u): u is string => !!u);

                const hasImage = imgs.length > 0;

                // 文字 HTML：移除图片再取 HTML
                const $textOnly = $body.clone();
                $textOnly.find('img, picture').remove();
                const textHtml = ($textOnly.html() || '').trim();

                // 标题：作者 + 楼层号（若能取到）
                const floor = $el.find('.message-attribution-opposite a').last().text().trim();
                const title = author ? `${author}${floor ? ' - ' + floor : ''}` : floor || 'New post';

                // 描述：Source 链接 + 文字 + 图片
                const imagesHtml = hasImage ? imgs.map((u) => `<p><img src="${u}" referrerpolicy="no-referrer" /></p>`).join('') : '';
                const description = `
                    <p><a href="${link}">🔗 Source post</a></p>
                    ${textHtml}${imagesHtml}
                `;

                return {
                    title,
                    link,
                    guid: link,
                    description,
                    author,
                    pubDate,
                    category: hasImage ? ['image'] : undefined, // 有图打标签，供全局过滤使用
                };
            })
            .filter(Boolean) as NonNullable<any>[];
    });

    // 4) 显式排序：postId 降序；再按时间兜底
    items.sort((a, b) => {
        const ida = getPostId(a.link);
        const idb = getPostId(b.link);
        if (idb !== ida) {
            return idb - ida;
        }
        const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return tb - ta;
    });

    // 5) 标题取“最新页”的 <h1>
    const title =
        load(htmlList.at(-1) ?? '')('h1')
            .first()
            .text()
            .trim() || `ResetEra Thread ${id}`;

    return {
        title,
        link: targetUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/thread/:id',
    name: 'Thread latest posts (text & images)',
    url: 'resetera.com',
    example: '/resetera/thread/1076160',
    parameters: {
        id: 'Numeric thread ID at the end of the URL',
    },
    maintainers: ['ZEN-GUO'],
    categories: ['bbs'],
    radar: [
        {
            source: ['resetera.com/threads/:slug.:id/'],
            target: '/thread/:id',
        },
    ],
    handler,
};
