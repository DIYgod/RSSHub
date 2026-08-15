import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface NewsletterPost {
    title: string;
    summary: string;
    url: string;
    date: string;
    thumbnail: string;
    bodyPreview: string;
    author: string;
}

interface NewsletterResponse {
    posts: NewsletterPost[];
}

export const route: Route = {
    name: 'Daily Newsletter',
    categories: ['other'],
    path: '/daily',
    example: '/forwardfuture/daily',
    radar: [
        {
            source: ['forwardfuture.com/newsletter/daily', 'forwardfuture.com/'],
        },
    ],
    handler,
    maintainers: ['ovo-Tim'],
    description: 'Daily AI newsletter from Forward Future.',
};

async function handler(ctx: Context): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30;

    const response = await ofetch<NewsletterResponse>('https://forwardfuture.com/api/newsletter');
    const posts = response.posts.slice(0, limit);

    const items: DataItem[] = posts.map((post) => ({
        title: post.title,
        description: post.summary,
        link: `https://forwardfuture.com${post.url}`,
        pubDate: parseDate(post.date, 'MMM D, YYYY'),
        author: post.author,
        image: post.thumbnail,
    }));

    return {
        title: 'Forward Future - Daily Newsletter',
        link: 'https://forwardfuture.com/newsletter/daily',
        description: "The Future Today - Forward Future's free daily AI newsletter.",
        item: items,
        image: 'https://forwardfuture.com/images/logos/ff-icon.svg',
    };
}
