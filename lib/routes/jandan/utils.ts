import { load } from 'cheerio';
import sanitizeHtml from 'sanitize-html';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

/**
 * Extract page ID from script tags and title
 */
export const extractPageMeta = (url: string) =>
    cache.tryGet(`jandan:pageMeta:${url}`, async () => {
        const response = await ofetch(url);

        const $ = load(response);

        return {
            pageId:
                $('script:contains("PAGE")')
                    .text()
                    .match(/PAGE\s*=\s*\{\s*id\s*:\s*(\d+)\s*\}/)?.[1] ?? '',
            title: $('title').text().trim(),
        };
    });

/**
 * Handle the top section (热榜)
 */
export const handleTopSection = async (rootUrl: string, type: string): Promise<{ title: string; items: DataItem[] }> => {
    const apiUrl = `${rootUrl}/api/top/${type}`;
    const response = await ofetch(apiUrl);

    let title = '热榜';
    switch (type) {
        case 'pic3days':
            title += ' - 3天内无聊图';
            break;
        case 'pic7days':
            title += ' - 7天内无聊图';
            break;
        default:
            title += ' - 4小时热门';
            break;
    }

    if (response.code !== 0) {
        throw new Error(`未能获取热榜数据: ${title}`);
    }

    const items = response.data.map((item) => {
        const content = item.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, () => src.replace(/^https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn')));

        return {
            author: item.author,
            title: `${item.author}: ${sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })}`,
            description: content,
            pubDate: parseDate(item.date_gmt),
            link: `${rootUrl}/t/${item.id}`,
        } as DataItem;
    });

    return { title, items };
};

/**
 * Handle the forum/bbs section (鱼塘)
 */
export const handleForumSection = async (rootUrl: string): Promise<{ title: string; items: DataItem[]; link: string }> => {
    const title = '煎蛋 - 鱼塘';
    const currentUrl = `${rootUrl}/new/forum`;

    const forumId = 112928;
    const apiUrl = `${rootUrl}/api/forum/posts/${forumId}?page=1`;
    const forumData = await ofetch(apiUrl);

    if (forumData.code !== 0) {
        throw new Error('未能获取鱼塘数据');
    }

    const items = forumData.data.list.map(
        (post) =>
            ({
                author: post.author_name,
                title: post.title,
                pubDate: parseDate(post.create_time),
                updated: parseDate(post.update_time),
                link: `${rootUrl}/new/forum/topic/${post.post_id}`,
                category: post.reply_count > 0 ? [`${post.reply_count}条回复`] : undefined,
            }) as DataItem
    );

    return { title, items, link: currentUrl };
};

/**
 * Handle other sections (问答, 树洞, 随手拍, 女装, 无聊图)
 */
export const handleCommentSection = async (rootUrl: string, category: string): Promise<{ title: string; items: DataItem[] }> => {
    const currentUrl = `${rootUrl}/${category}`;

    const { pageId, title: pageTitle } = await extractPageMeta(currentUrl);
    const title = pageTitle || `煎蛋 - ${category}`;

    if (!pageId) {
        throw new Error('无法从页面中获取到帖子ID，可能网站结构已变更');
    }

    const apiUrl = `${rootUrl}/api/comment/post/${pageId}?order=desc&page=0`;
    const commentsData = await ofetch(apiUrl);

    if (commentsData.code !== 0) {
        throw new Error('没有获取到内容，可能需要更新解析规则');
    }

    const items = commentsData.data.list.map((comment) => {
        const content = comment.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, () => src.replace(/^https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn')));

        return {
            author: comment.author,
            title: `${comment.author}: ${sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })}`,
            description: content,
            pubDate: parseDate(comment.date_gmt),
            link: `${rootUrl}/t/${comment.id}`,
        } as DataItem;
    });

    return { title, items };
};
