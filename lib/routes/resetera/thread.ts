// lib/routes/resetera/thread.ts
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

const BASE = 'https://www.resetera.com';

/**
 * 将 URL 统一成绝对地址
 * - 兼容 // 开头
 * - 兼容 / 开头
 * - 兼容 #fragment（补上 root，默认用 BASE，也可以传 threadRoot）
 */
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

    // 1) 先抓首页，解析“最后一页”（多策略更稳）
    const firstHtml = await ofetch<string>(threadRoot);
    const $ = load(firstHtml);

    let lastPage = 1;

    // 策略1：直接找“最后一页”链接
    const lastHref = $('a.pageNav-jump--last').attr('href') || $('a.pageNav-last').attr('href') || $('link[rel="last"]').attr('href') || '';

    if (lastHref) {
        const m = lastHref.match(/page-(\d+)/);
        if (m) {
            lastPage = Number(m[1]);
        }
    } else {
        // 策略2：从所有分页链接取最大 page-XX
        $('a[href*="page-"]').each((_, a) => {
            const h = $(a).attr('href') || '';
            const m = h.match(/page-(\d+)/);
            if (m) {
                lastPage = Math.max(lastPage, Number(m[1]));
            }
        });
        // 策略3：兜底，从 "Page X of N" 文本推断
        if (lastPage === 1) {
            const txt = $('nav.pageNav').text() || '';
            const m = txt.match(/of\s+(\d+)/i);
            if (m) {
                lastPage = Number(m[1]);
            }
        }
    }

    // 最新页的 URL（供 feed.link / 回退链接使用）
    const targetUrl = lastPage === 1 ? threadRoot : `${threadRoot}page-${lastPage}`;

    // 2) 抓取倒数第 1、2 页并合并
    const pages = lastPage > 1 ? [lastPage - 1, lastPage] : [1];
    const htmlList = await Promise.all(pages.map((p) => ofetch<string>(p === 1 ? threadRoot : `${threadRoot}page-${p}`)));

    // 3) 解析两页的帖子
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

                // 时间
                const timeEl = $el.find('time').first();
                const dataTime = Number(timeEl.attr('data-time') || 0);
                const pubDate = timeEl.attr('datetime') || (dataTime ? new Date(dataTime * 1000).toUTCString() : undefined);

                // 正文容器（clone 一份，后续会删节点）
                const $body = $el.find('.message-body .bbWrapper, .message-content .bbWrapper, .bbWrapper').first().clone();

                // === 关键变更 1：在“去引用之前”先收集图片，避免“只有引用里有图”被判无图 ===
                const imgsBeforeStrip = $body
                    .find('img, picture source')
                    .toArray()
                    .map((node) => {
                        const $n = $$(node);
                        const src = $n.attr('src') || $n.attr('data-src') || $n.attr('data-original') || $n.attr('data-url') || pickFromSrcset($n.attr('srcset')) || pickFromSrcset($n.attr('data-srcset'));
                        return absolutize(src || '', threadRoot);
                    })
                    .filter((u): u is string => !!u);

                // 去掉引用块（显示时不展示引用，但我们上面已经拿到其中的图片了）
                $body.find('.bbCodeBlock--quote, blockquote.bbCodeBlock').remove();

                // 展开剧透（移除标题，保留内容）
                $body.find('.bbCodeBlock--spoiler .bbCodeBlock-title').remove();

                // 显示用的文本 HTML：移除 <img> 再取 HTML
                const $textOnly = $body.clone();
                $textOnly.find('img, picture').remove();
                const textHtml = ($textOnly.html() || '').trim();

                // === 关键变更 2：仅当“确实有内容（至少有图）”时，才进行去重登记 ===
                if (!link) {
                    return null;
                }
                if (imgsBeforeStrip.length === 0) {
                    return null;
                } // 仍维持“无图丢弃”的策略
                if (seen.has(link)) {
                    return null;
                }
                seen.add(link);

                // 描述：加“Source post”直达 + 文字 + 图片（已 absoltize）
                const imagesHtml = imgsBeforeStrip.map((u) => `<p><img src="${u}" referrerpolicy="no-referrer" /></p>`).join('');
                const description = `
                    <p><a href="${link}">🔗 Source post</a></p>
                    ${textHtml}${imagesHtml}
                `;

                // 标题：作者 + 楼层号（若能取到）
                const floor = $el.find('.message-attribution-opposite a').last().text().trim();
                const title = author ? `${author}${floor ? ' - ' + floor : ''}` : floor || 'New post';

                return {
                    title,
                    link,
                    guid: link, // 用楼层永久链接作为唯一 ID
                    description,
                    author,
                    pubDate,
                };
            })
            .filter(Boolean) as NonNullable<any>[];
    });

    // 4) 显式排序：优先按 postId（大→小 = 新→旧），再按时间兜底
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

    // 5) 标题用“最新页”的 <h1>
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
    name: 'Thread 最新回帖（仅含文字与图片）',
    url: 'resetera.com',
    example: '/resetera/thread/1076160',
    parameters: { id: 'ResetEra 主题的数字 ID（URL 末尾的那串）' },
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
