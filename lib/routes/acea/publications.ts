import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.acea.auto';

export const route: Route = {
    path: '/publications/:type?',
    example: '/acea/publications/press-releases',
    name: 'Publications',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    parameters: { type: 'Native content type, e.g. press-releases, facts, figures or publications. Defaults to press-releases.' },
    radar: [{ source: ['www.acea.auto/nav/'], target: '/publications' }],
    handler,
};

function getItem(post) {
    return cache.tryGet(post.permalink, async () => {
        const response = await ofetch(post.permalink);
        const $ = load(response);
        const content = $('main.site-main');
        content.find('h1, .meta-before, .post-categories, script, style, .share-buttons, .related-posts, .abtpc, .abt-i').remove();
        return {
            title: post.title,
            link: post.permalink,
            pubDate: parseDate(post.date, 'D MMMM YYYY'),
            category: post.tag?.map((tag) => tag.name),
            description: content.html() || post.excerpt,
        };
    });
}

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'press-releases';
    const response = await ofetch(`${baseUrl}/wp-admin/admin-ajax.php`, {
        method: 'POST',
        responseType: 'json',
        body: new URLSearchParams({ action: 'load_results', 'filters[content][]': type, 'filters[pageNumber]': '1', 'filters[orderby]': 'date' }),
    });
    const limit = Number(ctx.req.query('limit')) || 20;
    return {
        title: `ACEA - ${type}`,
        link: `${baseUrl}/nav/?content=${encodeURIComponent(type)}`,
        language: 'en' as const,
        item: await pMap(response.posts.slice(0, limit), getItem, { concurrency: 3 }),
    };
}
