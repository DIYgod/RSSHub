import sanitizeHtml from 'sanitize-html';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

// Fixed post IDs of the comment sections, as defined by the site itself
const sections = {
    pic: { postId: 26402, title: '无聊图' },
    treehole: { postId: 102312, title: '树洞' },
    beauty: { postId: 108629, title: '女装' },
    ooxx: { postId: 21183, title: '随手拍' },
};

// The top and comment APIs return `data: null` unless the request comes from the site
const apiHeaders = (rootUrl: string) => ({ Referer: `${rootUrl}/` });

/**
 * Handle the top section (热榜)
 */
export const handleTopSection = async (rootUrl: string, type: string): Promise<{ title: string; items: DataItem[] }> => {
    const apiUrl = `${rootUrl}/api/top/${type}`;
    const response = await ofetch(apiUrl, { headers: apiHeaders(rootUrl) });

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

    if (response.code !== 0 || !response.data) {
        throw new Error(`未能获取热榜数据: ${title}`);
    }

    const items = response.data.map((item): DataItem => {
        const content = item.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, () => src.replace(/^https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn')));

        return {
            author: item.author,
            title: `${item.author}: ${sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })}`,
            description: content,
            pubDate: parseDate(item.date_gmt),
            link: `${rootUrl}/t/${item.id}`,
        };
    });

    return { title, items };
};

/**
 * Handle the forum/bbs section (鱼塘)
 */
export const handleForumSection = async (rootUrl: string): Promise<{ title: string; items: DataItem[]; link: string }> => {
    const title = '煎蛋 - 鱼塘';
    const currentUrl = `${rootUrl}/forum`;

    const forumId = 112928;
    const apiUrl = `${rootUrl}/api/forum/posts/${forumId}?page=1`;
    const forumData = await ofetch(apiUrl);

    if (forumData.code !== 0) {
        throw new Error('未能获取鱼塘数据');
    }

    const items = forumData.data.list.map((post): DataItem => ({
        author: post.author_name,
        title: post.title,
        pubDate: parseDate(post.create_time),
        updated: parseDate(post.update_time),
        link: `${rootUrl}/forum/topic/${post.post_id}`,
        category: post.reply_count > 0 ? [`${post.reply_count}条回复`] : undefined,
    }));

    return { title, items, link: currentUrl };
};

/**
 * Handle other sections (树洞, 随手拍, 女装, 无聊图)
 */
export const handleCommentSection = async (rootUrl: string, category: string): Promise<{ title: string; items: DataItem[] }> => {
    const section = sections[category];

    if (!section) {
        throw new InvalidParameterError(`未知板块: ${category}`);
    }

    const title = `煎蛋 - ${section.title}`;

    const apiUrl = `${rootUrl}/api/comment/post/${section.postId}?order=desc&page=0`;
    const commentsData = await ofetch(apiUrl, { headers: apiHeaders(rootUrl) });

    if (commentsData.code !== 0 || !commentsData.data) {
        throw new Error('没有获取到内容，可能需要更新解析规则');
    }

    const items = commentsData.data.list.map((comment): DataItem => {
        const content = comment.content.replaceAll(/img src="(.*?)"/g, (match, src) => match.replace(src, () => src.replace(/^https?:\/\/(\w+)\.moyu\.im/, 'https://$1.sinaimg.cn')));

        return {
            author: comment.author,
            title: `${comment.author}: ${sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} })}`,
            description: content,
            pubDate: parseDate(comment.date_gmt),
            link: `${rootUrl}/t/${comment.id}`,
        };
    });

    return { title, items };
};
