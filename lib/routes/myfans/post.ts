import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { showByUsername, getPostByAccountId, baseUrl } from './utils';
import path from 'node:path';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/user/:username',
    categories: ['multimedia'],
    example: '/myfans/user/secret_japan',
    parameters: { username: 'User handle' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['myfans.jp/:username', 'myfans.jp/:language/:username'],
        },
    ],
    name: 'User Posts',
    maintainers: ['TonyRL'],
    handler,
};

const render = (postImages, body) =>
    art(path.join(__dirname, 'templates/post.art'), {
        postImages,
        body,
    });

async function handler(ctx) {
    const { username } = ctx.req.param();

    const account = await showByUsername(username);
    const posts = await getPostByAccountId(account.id);

    const items = posts.map((p) => ({
        title: p.body?.replaceAll('\r\n', ' ').trim().split(' ')[0],
        description: render(p.post_images, p.body?.replaceAll('\r\n', '<br>')),
        pubDate: parseDate(p.published_at),
        link: `${baseUrl}/posts/${p.id}`,
        author: p.user.name,
    }));

    return {
        title: `${account.name} (@${account.username})`,
        link: `${baseUrl}/${account.username}`,
        description: `${account.posts_count} Post ${account.likes_count} Like ${account.followers_count}
Followers ${account.followings_count} Follow ${account.about.replaceAll('\r\n', ' ')}`,
        image: account.avatar_url,
        icon: account.avatar_url,
        logo: account.avatar_url,
        language: 'ja-JP',
        item: items,
    };
}
