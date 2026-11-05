import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const baseUrl = 'https://rarehistoricalphotos.com';

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/rarehistoricalphotos',
    radar: [
        {
            source: ['rarehistoricalphotos.com/'],
            target: '',
        },
    ],
    name: 'Home',
    maintainers: ['TonyRL'],
    handler,
    url: 'rarehistoricalphotos.com/',
};

async function handler(ctx) {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(Math.floor(requestedLimit), 100) || undefined : undefined;

    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: limit,
        },
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        link: item.link,
        pubDate: item.date_gmt ? parseDateInTimezone(item.date_gmt, 0) : undefined,
    }));

    return {
        title: 'Rare Historical Photos',
        description: 'And the story behind them...',
        link: baseUrl,
        image: 'https://rarehistoricalphotos.com/wp-content/uploads/2022/04/cropped-rarehistoricalphotos-32x32.png',
        language: 'en-us' as const satisfies Language,
        item: items,
    };
}
