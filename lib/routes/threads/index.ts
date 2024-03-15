import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { PROFILE_QUERY, REPLIES_QUERY, THREADS_QUERY, apiUrl, threadUrl, profileUrl, extractTokens, makeHeader, buildContent } from './utils';

export const route: Route = {
    path: '/:user/:routeParams?',
    categories: ['social-media'],
    example: '/threads/zuck',
    parameters: { user: 'Username', routeParams: 'Extra parameters, see the table below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
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

    return {
        title: `${user} (@${user}) on Threads`,
        link: profileUrl(user),
        image: userData.hd_profile_pic_versions?.sort((a, b) => b.width - a.width)[0].url ?? userData.profile_pic_url,
        description: userData.biography,
        item: items,
    };
}
