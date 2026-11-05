import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

import { buildContent, extractProfile, extractThreadItems, getPubDate, parseRouteOptions, profileUrl, threadUrl } from './utils';

export const route: Route = {
    path: '/:user/:routeParams?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/threads/zuck',
    parameters: {
        user: 'Username',
        routeParams: {
            description: `Extra parameters, see the table below
Specify options (in the format of query string) in parameter \`routeParams\` to control some extra features for threads

| Key                            | Description                                                                                                                  | Accepts                | Defaults to |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------- |
| \`showAuthorInTitle\`            | Show author name in title                                                                                                    | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`showAuthorInDesc\`             | Show author name in description (RSS body)                                                                                   | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`showQuotedAuthorAvatarInDesc\` | Show avatar of quoted author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`showAuthorAvatarInDesc\`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)        | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`    |
| \`showEmojiForQuotesAndReply\`   | Use "🔁" instead of "QT", "↩️" instead of "Re"                                                                               | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`showQuotedInTitle\`            | Show quoted tweet in title                                                                                                   | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`replies\`                      | Show replies                                                                                                                 | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |`,
        },
    },
    name: 'User timeline',
    maintainers: ['ninboy', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const { user: rawUser, routeParams } = ctx.req.param();
    const user = rawUser.startsWith('@') ? rawUser.slice(1) : rawUser;
    const options = parseRouteOptions(new URLSearchParams(routeParams));

    const response = await ofetch(options.replies ? `${profileUrl(user)}/replies` : profileUrl(user));
    const $ = load(response);

    const threadsData = extractThreadItems($);

    // A profile that has never posted still embeds its timeline with empty edges, so only a page without it is a failure
    if (!threadsData.length && !$('script[data-sjs]:contains("mediaData")').text().includes('"mediaData":{"edges":[]')) {
        throw new Error('Failed to fetch thread data');
    }

    const profile = extractProfile($);

    ctx.set('json', threadsData);

    const items = threadsData
        .filter((item) => user === item.post.user?.username)
        .map((item) => {
            const { title, description } = buildContent(item, options);
            return {
                author: user,
                title,
                description,
                pubDate: getPubDate(item.post.taken_at),
                link: threadUrl(item.post.code),
            };
        });

    return {
        title: `${profile?.full_name || user} (@${user}) on Threads`,
        description: profile?.biography,
        link: profileUrl(user),
        image: profile?.profile_pic_url ?? threadsData[0]?.post.user?.profile_pic_url,
        item: items,
        allowEmpty: true,
    };
}
