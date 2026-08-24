import type { CheerioAPI } from 'cheerio';
import dayjs from 'dayjs';

import { queryToBoolean } from '@/utils/readable-social';

export const profileUrl = (user: string) => `https://www.threads.com/@${user}`;
export const threadUrl = (code: string) => `https://www.threads.com/t/${code}`;

export interface ThreadItem {
    post: {
        user?: {
            username: string;
            profile_pic_url: string;
        };
        taken_at: number;
        code: string;
        caption?: {
            text: string;
        };
    };
}

const findThreadItems = (node, acc: ThreadItem[] = []): ThreadItem[] => {
    if (node instanceof Object) {
        if (Array.isArray(node.thread_items)) {
            acc.push(...node.thread_items);
        }
        for (const value of Object.values(node)) {
            findThreadItems(value, acc);
        }
    }
    return acc;
};

export const extractThreadItems = ($: CheerioAPI): ThreadItem[] => {
    let threadsData: ThreadItem[] = [];
    $('script[data-sjs]:contains("thread_items")').each((_, script) => {
        threadsData = findThreadItems(JSON.parse($(script).text()));
        return threadsData.length === 0;
    });
    return threadsData;
};

export const parseRouteOptions = (params: URLSearchParams) => ({
    showAuthorInTitle: queryToBoolean(params.get('showAuthorInTitle')) ?? true,
    showAuthorInDesc: queryToBoolean(params.get('showAuthorInDesc')) ?? true,
    showAuthorAvatarInDesc: queryToBoolean(params.get('showAuthorAvatarInDesc')) ?? false,
    showQuotedInTitle: queryToBoolean(params.get('showQuotedInTitle')) ?? true,
    showQuotedAuthorAvatarInDesc: queryToBoolean(params.get('showQuotedAuthorAvatarInDesc')) ?? false,
    showEmojiForQuotesAndReply: queryToBoolean(params.get('showEmojiForQuotesAndReply')) ?? true,
    replies: queryToBoolean(params.get('replies')) ?? false,
});

const hasMedia = (post) => post.image_versions2 || post.carousel_media || post.video_versions;

const buildMedia = (post) => {
    let html = '';

    if (post.carousel_media) {
        for (const media of post.carousel_media) {
            const firstImage = media.image_versions2?.candidates[0];
            const firstVideo = media.video_versions?.[0];
            html += firstVideo ? `<video controls autoplay loop poster="${firstImage.url}"><source src="${firstVideo.url}"/></video>` : `<img src="${firstImage.url}"/>`;
        }
    } else {
        const mainImage = post.image_versions2?.candidates?.[0];
        const mainVideo = post.video_versions?.[0];
        if (mainImage) {
            html += mainVideo ? `<video controls autoplay loop poster="${mainImage.url}"><source src="${mainVideo.url}"/></video>` : `<img src="${mainImage.url}"/>`;
        }
    }

    return html;
};

export const buildContent = (item, options) => {
    let title = '';
    let description = '';
    const quotedPost = item.post.text_post_app_info?.share_info?.quoted_post;
    const repostedPost = item.post.text_post_app_info?.share_info?.reposted_post;
    const isReply = item.post.text_post_app_info?.reply_to_author;
    const embededPost = quotedPost ?? repostedPost;

    if (options.showAuthorInTitle) {
        title += `@${item.post.user?.username}: `;
    }

    if (options.showAuthorInDesc) {
        description += '<p>';
        if (options.showAuthorAvatarInDesc) {
            description += `<img src="${item.post.user?.profile_pic_url}" width="48px" height="48px"> `;
        }
        description += `<strong>@${item.post.user?.username}</strong>`;
        if (embededPost) {
            description += options.showEmojiForQuotesAndReply ? ' 🔁' : ' quoted';
        } else if (isReply) {
            description += options.showEmojiForQuotesAndReply ? ' ↩️' : ' replied';
        }
        description += ':</p>';
    }

    if (item.post.caption?.text) {
        title += item.post.caption?.text;
        description += `<p>${item.post.caption?.text}</p>`;
    }

    if (hasMedia(item.post)) {
        description += `<p>${buildMedia(item.post)}</p>`;
    }

    if (embededPost) {
        if (options.showQuotedInTitle) {
            title += options.showEmojiForQuotesAndReply ? ' 🔁 ' : ' QT: ';
            title += `@${embededPost.user?.username}: `;
            title += `"${embededPost.caption?.text}"`;
        }
        description += '<blockquote>';
        description += `<p>${embededPost.caption?.text}</p>`;
        if (hasMedia(embededPost)) {
            description += `<p>${buildMedia(embededPost)}</p>`;
        }
        description += '— ';
        if (options.showQuotedAuthorAvatarInDesc) {
            description += `<img src="${embededPost.user?.profile_pic_url}" width="24px" height="24px"> `;
        }
        description += `@${embededPost.user?.username} — `;
        description += `<a href="${threadUrl(embededPost.code)}">${dayjs(embededPost.taken_at, 'X').toString()}</a>`;
        description += '</blockquote>';
    }
    return { title, description };
};
