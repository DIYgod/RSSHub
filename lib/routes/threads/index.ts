// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const { PROFILE_QUERY, REPLIES_QUERY, THREADS_QUERY, apiUrl, threadUrl, profileUrl, extractTokens, makeHeader, buildContent } = require('./utils');

export default async (ctx) => {
    const { user, routeParams } = ctx.req.param();
    const { lsd, userId } = await extractTokens(user, ctx);

    const params = new URLSearchParams(routeParams);
    const json = {
        params: routeParams,
    };

    const options = {
        showAuthorInTitle: params.get('showAuthorInTitle') ?? true,
        showAuthorInDesc: params.get('showAuthorInDesc') ?? true,
        showAuthorAvatarInDesc: params.get('showAuthorAvatarInDesc') ?? false,
        showQuotedInTitle: params.get('showQuotedInTitle') ?? true,
        showQuotedAuthorAvatarInDesc: params.get('showQuotedAuthorAvatarInDesc') ?? false,
        showEmojiForQuotesAndReply: params.get('showEmojiForQuotesAndReply') ?? true,
        replies: params.get('replies') ?? false,
    };

    const { data: profileResponse } = await got.post(apiUrl, {
        headers: makeHeader(user, lsd),
        form: {
            lsd,
            variables: JSON.stringify({ userID: userId }),
            doc_id: PROFILE_QUERY,
        },
    });

    const { data: threadsResponse, request: threadsRequest } = await got.post(apiUrl, {
        headers: makeHeader(user, lsd),
        form: {
            lsd,
            variables: JSON.stringify({ userID: userId }),
            doc_id: options.replies ? REPLIES_QUERY : THREADS_QUERY,
        },
    });

    json.profileData = profileResponse;
    json.request = {
        headers: threadsRequest.options.headers,
        body: threadsRequest.options.body,
    };

    const userData = profileResponse?.data?.userData?.user || {};
    const threads = threadsResponse?.data?.mediaData?.threads || [];

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

    json.items = items;
    ctx.set('json', json);

    ctx.set('data', {
        title: `${user} (@${user}) on Threads`,
        link: profileUrl(user),
        image: userData.hd_profile_pic_versions?.sort((a, b) => b.width - a.width)[0].url ?? userData.profile_pic_url,
        description: userData.biography,
        item: items,
    });
};
