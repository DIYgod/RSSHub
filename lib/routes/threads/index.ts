import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { REPLIES_QUERY, THREADS_QUERY, apiUrl, threadUrl, profileUrl, extractTokens, makeHeader, getUserId, buildContent } from './utils';
import { destr } from 'destr';
import cache from '@/utils/cache';
import { config } from '@/config';

export const route: Route = {
    path: '/:user/:routeParams?',
    categories: ['social-media'],
    example: '/threads/zuck',
    parameters: { user: 'Username', routeParams: 'Extra parameters, see the table below' },
    name: 'User timeline',
    maintainers: ['ninboy'],
    handler,
    description: `Specify options (in the format of query string) in parameter \`routeParams\` to control some extra features for threads

  | Key                            | Description                                                                                                                  | Accepts                | Defaults to |
  | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------- |
  | \`showAuthorInTitle\`            | Show author name in title                                                                                                    | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
  | \`showAuthorInDesc\`             | Show author name in description (RSS body)                                                                                   | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
  | \`showQuotedAuthorAvatarInDesc\` | Show avatar of quoted author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
  | \`showAuthorAvatarInDesc\`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)        | \`0\`/\`1\`/\`true\`/\`false\` | \`falseP\`    |
  | \`showEmojiForQuotesAndReply\`   | Use "🔁" instead of "QT", "↩️" instead of "Re"                                                                               | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
  | \`showQuotedInTitle\`            | Show quoted tweet in title                                                                                                   | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
  | \`replies\`                      | Show replies                                                                                                                 | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |

  Specify different option values than default values to improve readability. The URL

  \`\`\`
  https://rsshub.app/threads/zuck/showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForQuotesAndReply=1&showQuotedInTitle=1
  \`\`\``,
};

async function handler(ctx) {
    const { user, routeParams } = ctx.req.param();
    const { lsd } = await extractTokens(user);
    const userId = await getUserId(user, lsd);

    const params = new URLSearchParams(routeParams);
    const debugJson = {
        params: routeParams,
        lsd,
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

    const threadsResponse = await cache.tryGet(
        `threads:${userId}:${options.replies}`,
        () =>
            ofetch(apiUrl, {
                method: 'POST',
                headers: {
                    ...makeHeader(user, lsd),
                    'content-type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    lsd,
                    variables: JSON.stringify({ userID: userId }),
                    doc_id: String(options.replies ? REPLIES_QUERY : THREADS_QUERY),
                }).toString(),
                parseResponse: (txt) => destr(txt),
            }),
        config.cache.routeExpire,
        false
    );

    debugJson.profileId = userId;
    debugJson.response = {
        response: threadsResponse,
    };

    const threads = threadsResponse?.data?.mediaData?.threads || [];
    const userData = threadsResponse?.data?.mediaData?.threads?.[0]?.thread_items?.[0]?.post?.user || {};

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

    debugJson.items = items;
    ctx.set('json', debugJson);

    return {
        title: `${user} (@${user}) on Threads`,
        link: profileUrl(user),
        image: userData?.profile_pic_url,
        // description: userData.biography,
        item: items,
    };
}
