import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Articles } from './types';
import { getSignedHeader, header, processImage } from './utils';

export const route: Route = {
    path: '/posts/:usertype/:id',
    categories: ['social-media'],
    example: '/zhihu/posts/people/frederchen',
    parameters: { usertype: '作者 id，可在用户主页 URL 中找到', id: '用户类型usertype，参考用户主页的URL。目前有两种，见下表' },
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: '',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/:usertype/:id/posts', 'www.zhihu.com/:usertype/:id'],
        },
    ],
    name: '用户文章',
    maintainers: ['whtsky', 'Colin-XKL'],
    handler,
    description: `| 普通用户 | 机构用户 |
| -------- | -------- |
| people   | org      |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const usertype = ctx.req.param('usertype');

    const userProfile = await cache.tryGet(`zhihu:posts:profile:${id}`, async () => {
        // Read the profile from the API instead of scraping the user's HTML
        // homepage, which is now rate-limited (403) more aggressively than the API.
        const profileApiPath = `/api/v4/members/${id}`;

        const result = await ofetch(`https://www.zhihu.com${profileApiPath}`, {
            headers: {
                ...header,
                ...(await getSignedHeader(`https://www.zhihu.com/${usertype}/${id}/`, profileApiPath)),
                Referer: `https://www.zhihu.com/${usertype}/${id}/`,
            },
        });

        return {
            name: result.name,
            headline: result.headline,
            avatarUrl: result.avatar_url,
        };
    });

    const apiPath = `/api/v4/members/${id}/articles?${new URLSearchParams({
        include:
            'data[*].comment_count,suggest_edit,is_normal,thumbnail_extra_info,thumbnail,can_comment,comment_permission,admin_closed_comment,content,voteup_count,created,updated,upvoted_followees,voting,review_info,reaction_instruction,is_labeled,label_info;data[*].vessay_info;data[*].author.badge[?(type=best_answerer)].topics;data[*].author.vip_info;',
        offset: '0',
        limit: '20',
        sort_by: 'created',
    })}`;

    const signedHeader = await getSignedHeader(`https://www.zhihu.com/${usertype}/${id}/posts`, apiPath);

    const articleResponse = await ofetch<Articles>(`https://www.zhihu.com${apiPath}`, {
        headers: {
            ...header,
            ...signedHeader,
            Referer: `https://www.zhihu.com/${usertype}/${id}/posts`,
        },
    });

    const items = articleResponse.data.map((item) => ({
        title: item.title,
        description: processImage(item.content),
        link: `https://zhuanlan.zhihu.com/p/${item.id}`,
        pubDate: parseDate(item.created, 'X'),
        updated: parseDate(item.updated, 'X'),
        author: item.author.name,
    }));

    return {
        title: `${userProfile.name} 的知乎文章`,
        link: `https://www.zhihu.com/${usertype}/${id}/posts`,
        description: userProfile.headline,
        image: userProfile.avatarUrl.split('?', 1)[0],
        // banner: userData?.coverUrl?.split('?')[0],
        item: items,
    };
}
