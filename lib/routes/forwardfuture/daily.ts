import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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
    const limit = getRouteLimit(ctx, 30);

    const response = await ofetch<NewsletterResponse>('https://forwardfuture.com/api/newsletter');
    let items: DataItem[] = response.posts.map((post) => ({
        title: post.title,
        description: post.summary,
        link: `https://forwardfuture.com${post.url}`,
        pubDate: parseDate(post.date, 'MMM D, YYYY'),
        author: post.author,
        image: post.thumbnail,
    }));
    if (ctx.req.query('sorted') === 'false') {
        items = items.slice(0, limit);
    } else if (items.every((item) => item.pubDate instanceof Date && Number.isFinite(item.pubDate.getTime()))) {
        items = items.toSorted((a, b) => (b.pubDate as Date).getTime() - (a.pubDate as Date).getTime()).slice(0, limit);
    } else {
        items = items.slice(0, Math.max(30, limit));
    }

    return {
        title: 'Forward Future - Daily Newsletter',
        link: 'https://forwardfuture.com/newsletter/daily',
        description: "The Future Today - Forward Future's free daily AI newsletter.",
        item: items,
        image: 'https://forwardfuture.com/images/logos/ff-icon.svg',
    };
}
