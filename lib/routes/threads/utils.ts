import { load } from 'cheerio';
import dayjs from 'dayjs';
import cache from '@/utils/cache';
import NotFoundError from '@/errors/types/not-found';
import ofetch from '@/utils/ofetch';
import { JSDOM } from 'jsdom';
import { JSONPath } from 'jsonpath-plus';

const profileUrl = (user: string) => `https://www.threads.com/@${user}`;
const threadUrl = (code: string) => `https://www.threads.com/t/${code}`;

const USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

const extractTokens = async (user): Promise<{ lsd: string }> => {
    const response = await ofetch(profileUrl(user), {
        headers: {
            'User-Agent': USER_AGENT,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        },
    });

    const $ = load(response);
    const data = $('script:contains("LSD"):first').text();
    const lsd = data.match(/"LSD",\[],{"token":"([\w@-]+)"},/)?.[1];

    if (!lsd) {
        throw new NotFoundError('LSD token not found');
    }

    return { lsd };
};

const getUserId = (user: string): Promise<string> =>
    cache
        .tryGet(`threads:userId:${user}`, async () => {
            const response = await ofetch(profileUrl(user), {
                headers: {
                    'User-Agent': USER_AGENT,
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Encoding': 'gzip, br',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1',
                },
            });

            const dom = new JSDOM(response);

            for (const el of dom.window.document.querySelectorAll('script[data-sjs]')) {
                try {
                    const data = JSONPath({
                        path: '$..user_id',
                        json: JSON.parse(el.textContent || ''),
                    });

                    if (data?.[0]) {
                        return data[0];
                    }
                } catch {
                    // Skip invalid JSON
                }
            }

            throw new NotFoundError('User ID not found');
        })
        .then((result): string => {
            if (result) {
                if (typeof result === 'string') {
                    return result;
                } else if (typeof result === 'number') {
                    return result.toString();
                }
            }
            throw new TypeError('Invalid user ID type');
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

export { profileUrl, threadUrl, extractTokens, getUserId, buildContent };
