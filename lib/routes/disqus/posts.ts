import type { Context } from 'hono';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/posts/:forum',
    categories: ['social-media'],
    example: '/disqus/posts/diygod-me',
    parameters: { forum: 'forum, disqus name of the target website' },
    name: 'Comment',
    maintainers: ['DIYgod'],
    features: {
        requireConfig: [
            {
                name: 'DISQUS_API_KEY',
                optional: true,
                description: 'Disqus API key',
            },
        ],
    },
    handler,
};

async function handler(ctx: Context) {
    if (!config.disqus || !config.disqus.api_key) {
        config.disqus.api_key = 'E8Uh5l5fHZ6gD8U3KycjAIAk46f68Zw7C6eW8WSjZvCLXebZ7p0r1yrYDrLilk2F';
    }
    const { forum } = ctx.req.param();

    const response = await ofetch(`https://disqus.com/api/3.0/forums/listPosts.json?api_key=${config.disqus.api_key}&forum=${forum}`);

    const data = response.response;

    const threadsQuery = [...new Set(data.map((item) => item.thread))].map((thread) => `&thread=${thread}`).join('');

    const responseThreads = await ofetch(`https://disqus.com/api/3.0/forums/listThreads.json?api_key=${config.disqus.api_key}&forum=${forum}${threadsQuery}`);

    const threads = responseThreads.response;

    return {
        title: `${forum} 的评论`,
        link: `https://disqus.com/home/forums/${forum}`,
        description: `${forum} 的 disqus 评论`,
        item: data.map((item) => {
            const thread = threads.find((i) => i.id === item.thread);

            return {
                title: `${item.author.name}: ${item.raw_message}`,
                description: `${item.author.name} 在《${thread.clean_title}》中发表评论: ${item.message}`,
                pubDate: parseDate(item.createdAt),
                link: `${thread.link}/#comment-${item.id}`,
            };
        }),
    };
}
