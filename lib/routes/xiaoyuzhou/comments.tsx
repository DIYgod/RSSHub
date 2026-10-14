import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    author: { nickname: string };
}

export const route: Route = {
    path: '/comments/:id',
    categories: ['multimedia'],
    example: '/xiaoyuzhou/comments/5f573de183c34e85ddce9c8b',
    parameters: { id: '单集 id，可在单集页面 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{ source: ['xiaoyuzhoufm.com/episode/:id'], target: '/comments/:id' }],
    name: '单集热门评论',
    maintainers: ['DIYgod'],
    description: '订阅单集公开网页展示的热门评论。网页只展示部分热门评论，无法保证包含全部评论或每条最新评论。',
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `https://www.xiaoyuzhoufm.com/episode/${id}`;
    const response = await ofetch(link);
    const $ = load(response);
    const data = JSON.parse($('#__NEXT_DATA__').text()).props.pageProps;
    if (!data.episode || !Array.isArray(data.comments)) {
        throw new Error('Xiaoyuzhou did not return the episode and its public comments.');
    }

    return {
        title: `${data.episode.title} - 热门评论`,
        link,
        image: data.episode.image?.picUrl ?? data.episode.podcast?.image?.picUrl,
        item: data.comments.map((comment: Comment) => ({
            title: comment.text,
            author: comment.author.nickname,
            guid: comment.id,
            link: `${link}#comment-${comment.id}`,
            pubDate: parseDate(comment.createdAt),
            description: renderToString(
                <>
                    {comment.text.split('\n').map((paragraph) => (
                        <p>{paragraph}</p>
                    ))}
                </>
            ),
        })),
    };
}
