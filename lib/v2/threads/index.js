const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const dayjs = require('dayjs');

const profileUrl = (user) => `https://www.threads.net/@${user}`;
const threadUrl = (code) => `https://www.threads.net/t/${code}`;
const apiUrl = 'https://www.threads.net/api/graphql';
const THREADS_QUERY = 6232751443445612;
const REPLIES_QUERY = 6307072669391286;
const USER_AGENT = 'Barcelona 289.0.0.77.109 Android';

const load = async (url) => {
    // user id fetching needs puppeteer
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    browser.close();

    return cheerio.load(response);
};

const extractTokens = async (user, ctx) => {
    const $ = await load(profileUrl(user));
    const lsd = $('script:contains("LSD"):first')
        .html()
        .match(/"LSD",\[],\{"token":"([a-zA-Z0-9@_-]+)"},/)?.[1];

    // This needs puppeteer
    const userId = $('script:contains("user_id"):first')
        .html()
        .match(/"user_id":"(\d+)"/)?.[1];

    ctx.state.json = { lsd, userId };
    return { lsd, userId };
};

const makeHeader = (user, lsd) => ({
    Accept: 'application/json',
    Host: 'www.threads.net',
    Origin: 'https://www.threads.net',
    Referer: `https://www.threads.net/@${user}`,
    'User-Agent': USER_AGENT,
    'X-FB-LSD': lsd,
    'X-IG-App-ID': '238260118697367',
});

const hasMedia = (post) => post.image_versions2 || post.carousel_media || post.video_versions;
const buildMedia = (post) => {
    let html = '';

    if (!post.carousel_media) {
        const mainImage = post.image_versions2?.candidates?.[0];
        const mainVideo = post.video_versions?.[0];
        if (mainImage) {
            if (!mainVideo) {
                html += `<img src="${mainImage.url}"/>`;
            } else {
                html += `<video controls autoplay loop poster="${mainImage.url}">`;
                html += `<source src="${mainVideo.url}"/>`;
                html += '</video>';
            }
        }
    } else {
        post.carousel_media.forEach((media) => {
            const firstImage = media.image_versions2?.candidates[0];
            const firstVideo = media.video_versions?.[0];
            if (!firstVideo) {
                html += `<img src="${firstImage.url}"/>`;
            } else {
                html += `<video controls autoplay loop poster="${firstImage.url}">`;
                html += `<source src="${firstVideo.url}"/>`;
                html += '</video>';
            }
        });
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

module.exports = async (ctx) => {
    const { user, routeParams } = ctx.params;
    const { lsd, userId } = await extractTokens(user, ctx);

    const params = new URLSearchParams(routeParams);
    ctx.state.json.params = routeParams;

    const options = {
        showAuthorInTitle: params.get('showAuthorInTitle') ?? true,
        showAuthorInDesc: params.get('showAuthorInDesc') ?? true,
        showAuthorAvatarInDesc: params.get('showAuthorAvatarInDesc') ?? false,
        showQuotedInTitle: params.get('showQuotedInTitle') ?? true,
        showQuotedAuthorAvatarInDesc: params.get('showQuotedAuthorAvatarInDesc') ?? false,
        showEmojiForQuotesAndReply: params.get('showEmojiForQuotesAndReply') ?? true,
        replies: params.get('replies') ?? false,
    };

    const headers = makeHeader(user, lsd);
    const resp = await got.post(apiUrl, {
        headers,
        form: {
            lsd,
            variables: JSON.stringify({ userID: userId }),
            doc_id: options.replies ? REPLIES_QUERY : THREADS_QUERY,
        },
    });

    ctx.state.json.request = {
        headers: resp.request.options.headers,
        body: resp.request.options.body,
    };

    const responseBody = resp.data;
    const threads = responseBody?.data?.mediaData?.threads || [];

    const items = threads.flatMap((thread) =>
        thread.thread_items
            .filter((item) => user === item.post.user?.username)
            .map((item) => {
                const { title, description } = buildContent(item, options);
                return {
                    author: user,
                    title,
                    description,
                    pubDate: parseDate(item.post.taken_at, 'X'),
                    link: threadUrl(item.post.code),
                };
            })
    );

    ctx.state.json.items = items;

    ctx.state.data = {
        title: user,
        link: profileUrl(user),
        description: user,
        item: items,
    };
};
