import { Route, ViewType } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { threadUrl, profileUrl, extractTokens, getUserId, buildContent } from './utils';
import { JSDOM } from 'jsdom';
import { JSONPath } from 'jsonpath-plus';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:user/:routeParams?',
    categories: ['social-media', 'popular'],
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
    const { lsd } = await extractTokens(user);
    const userId = await getUserId(user);

    const params = new URLSearchParams(routeParams);
    const debugJson: any = {
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

    const response = await ofetch(profileUrl(user), {
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
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

    let threadsData: ThreadItem[] | null = null;
    for (const el of dom.window.document.querySelectorAll('script[data-sjs]')) {
        try {
            const data = JSONPath({
                path: '$..thread_items[0]',
                json: JSON.parse(el.textContent || ''),
            });

            if (data?.length > 0) {
                threadsData = data as ThreadItem[];
                break;
            }
        } catch {
            // Skip invalid JSON
        }
    }

    if (!threadsData) {
        throw new Error('Failed to fetch thread data');
    }

    debugJson.profileId = userId;
    debugJson.response = { response: threadsData };

    const userData: ThreadUser = threadsData[0]?.post?.user || { username: user, profile_pic_url: '' };

    const items = threadsData
        .filter((item) => user === item.post.user?.username)
        .map((item) => ({
            author: user,
            title: buildContent(item, options).title,
            description: buildContent(item, options).description,
            pubDate: parseDate(item.post.taken_at, 'X'),
            link: threadUrl(item.post.code),
        }));

    debugJson.items = items;
    ctx.set('json', debugJson);

    return {
        title: `${user} (@${user}) on Threads`,
        link: profileUrl(user),
        image: userData?.profile_pic_url,
        item: items,
    };
}

interface ThreadUser {
    username: string;
    profile_pic_url: string;
}

interface ThreadItem {
    post: {
        user?: ThreadUser;
        taken_at: number;
        code: string;
        caption?: {
            text: string;
        };
    };
}
