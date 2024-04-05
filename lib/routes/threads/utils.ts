import got from '@/utils/got';
import { load } from 'cheerio';
import dayjs from 'dayjs';

const profileUrl = (user) => `https://www.threads.net/@${user}`;
const threadUrl = (code) => `https://www.threads.net/t/${code}`;

const apiUrl = 'https://www.threads.net/api/graphql';
const PROFILE_QUERY = 23_996_318_473_300_828;
const THREADS_QUERY = 6_232_751_443_445_612;
const REPLIES_QUERY = 6_307_072_669_391_286;
const USER_AGENT = 'Barcelona 289.0.0.77.109 Android';
const appId = '238260118697367';

const extractTokens = async (user, ctx) => {
    const { data: response } = await got(profileUrl(user), {
        headers: {
            'User-Agent': USER_AGENT,
            'X-IG-App-ID': appId,
        },
    });
    const $ = load(response);

    const data = $('script:contains("LSD"):first').text();

    const lsd = data.match(/"LSD",\[],{"token":"([\w@-]+)"},/)?.[1];

    const userId = data.match(/{"user_id":"(\d+)"},/)?.[1];

    ctx.set('json', { lsd, userId });
    return { lsd, userId };
};

const makeHeader = (user, lsd) => ({
    Accept: 'application/json',
    Host: 'www.threads.net',
    Origin: 'https://www.threads.net',
    Referer: profileUrl(user),
    'User-Agent': USER_AGENT,
    'X-FB-LSD': lsd,
    'X-IG-App-ID': appId,
});

const hasMedia = (post) => post.image_versions2 || post.carousel_media || post.video_versions;
const buildMedia = (post) => {
    let html = '';

    if (post.carousel_media) {
        for (const media of post.carousel_media) {
            const firstImage = media.image_versions2?.candidates[0];
            const firstVideo = media.video_versions?.[0];
            if (firstVideo) {
                html += `<video controls autoplay loop poster="${firstImage.url}">`;
                html += `<source src="${firstVideo.url}"/>`;
                html += '</video>';
            } else {
                html += `<img src="${firstImage.url}"/>`;
            }
        }
    } else {
        const mainImage = post.image_versions2?.candidates?.[0];
        const mainVideo = post.video_versions?.[0];
        if (mainImage) {
            if (mainVideo) {
                html += `<video controls autoplay loop poster="${mainImage.url}">`;
                html += `<source src="${mainVideo.url}"/>`;
                html += '</video>';
            } else {
                html += `<img src="${mainImage.url}"/>`;
            }
        }
    }

    return html;
};

const buildContent = (item, options) => {
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

export { apiUrl, profileUrl, threadUrl, PROFILE_QUERY, THREADS_QUERY, REPLIES_QUERY, USER_AGENT, extractTokens, makeHeader, hasMedia, buildMedia, buildContent };
