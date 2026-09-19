import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildContent, extractThreadItems, parseRouteOptions, profileUrl, threadUrl } from './utils';

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
| \`showAuthorAvatarInDesc\`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)        | \`0\`/\`1\`/\`true\`/\`false\` | \`falseP\`    |
| \`showEmojiForQuotesAndReply\`   | Use "🔁" instead of "QT", "↩️" instead of "Re"                                                                               | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`showQuotedInTitle\`            | Show quoted tweet in title                                                                                                   | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`replies\`                      | Show replies                                                                                                                 | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |`,
        },
    },
    name: 'User timeline',
    maintainers: ['ninboy', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const { user, routeParams } = ctx.req.param();
    const options = parseRouteOptions(new URLSearchParams(routeParams));

    const response = await ofetch(profileUrl(user));
    const $ = load(response);

    const threadsData = extractThreadItems($);

    if (!threadsData.length) {
        throw new Error('Failed to fetch thread data');
    }

    ctx.set('json', threadsData);

    const items = threadsData
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
        });

    return {
        title: `${user} (@${user}) on Threads`,
        link: profileUrl(user),
        image: threadsData[0].post.user?.profile_pic_url,
        item: items,
    };
}
