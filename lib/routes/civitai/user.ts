import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:username/articles',
    categories: ['program-update'],
    example: '/civitai/user/Chenkin/articles',
    parameters: { username: 'Username' },
    radar: [
        {
            source: ['civitai.com/user/:username', 'civitai.com/user/:username/articles'],
        },
    ],
    name: 'User Article',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { username } = ctx.req.param();

    const userProfile = await cache.tryGet(`civitai:userProfile:${username}`, async () => {
        const response = await ofetch('https://civitai.com/api/trpc/userProfile.get', {
            query: {
                input: JSON.stringify({ json: { username } }),
            },
        });
        return response.result.data.json;
    });

    const article = await ofetch('https://civitai.com/api/trpc/article.getInfinite', {
        query: {
            input: JSON.stringify({
                json: {
                    period: 'AllTime',
                    periodMode: 'published',
                    sort: 'Newest',
                    username,
                    includeDrafts: false,
                    pending: true,
                    browsingLevel: 1,
                    excludedTagIds: [415792, 426772, 5188, 5249, 130818, 130820, 133182],
                    cursor: null,
                },
                meta: { values: { cursor: ['undefined'] } },
            }),
        },
    });

    if (!article.result.data.json.items.length) {
        throw new Error('This user has no articles.');
    }

    const list = article.result.data.json.items.map((item) => ({
        title: item.title,
        link: `https://civitai.com/articles/${item.id}`,
        id: item.id,
        pubDate: parseDate(item.publishedAt),
        updated: parseDate(item.publishedAt),
        author: item.user?.username,
        category: item.tags.map((tag) => tag.name),
        image: `https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${item.coverImage.url}/${item.coverImage.name}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch('https://civitai.com/api/trpc/article.getById', {
                    query: {
                        input: JSON.stringify({ json: { id: item.id } }),
                    },
                });

                item.description = response.result.data.json.content;

                return item;
            })
        )
    );

    return {
        title: `${username} Creator Profile | Civitai`,
        description: userProfile.profile.message.replaceAll('\n', ' ') || userProfile.profile.bio,
        link: `https://civitai.com/user/${username}/articles`,
        image: userProfile.image,
        item: items,
    };
}
