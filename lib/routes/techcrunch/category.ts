import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

import { renderDescription } from './templates/description';

const host = 'https://techcrunch.com';
export const route: Route = {
    path: '/category/:categoryId',
    categories: ['new-media'],
    example: '/techcrunch/category/577047203',
    parameters: {
        categoryId: '分类id',
    },
    name: 'Category',
    maintainers: ['MilliumOrion'],
    handler,
    description: `Use the category ID to retrieve a list of articles, category ID.\\
From the page source of \`https://techcrunch.com/category/***\`, locate the \`{category_id}\`\\
Example:\\
\`html\` -> \`head\` -> \`<link rel="alternate" title="JSON" type="application/json" href="https://techcrunch.com/wp-json/wp/v2/categories/{category_id}">\``,
};

async function handler(ctx) {
    const categoryId = ctx.req.param('categoryId');
    const { data } = await got(`${host}/wp-json/wp/v2/posts?categories=${categoryId}`);
    const items = data.map((item) => {
        const head = item.yoast_head_json;
        const article = head.schema?.['@graph']?.find((node) => node['@type'] === 'NewsArticle');
        const date = item.date_gmt || head.article_published_time;
        const $ = load(item.content.rendered, null, false);
        return {
            title: item.title.rendered,
            description: renderDescription({
                head,
                rendered: $.html(),
            }),
            link: item.link,
            pubDate: date ? parseDateInTimezone(date, 0) : undefined,
            author: head.author,
            category: [...new Set<string>([...(article?.articleSection ?? []), ...(article?.keywords ?? [])])].map((category) => $('<span>').html(category).text()),
        };
    });

    return {
        title: 'TechCrunch',
        link: host,
        description: 'Reporting on the business of technology, startups, venture capital funding, and Silicon Valley.',
        item: items,
    };
}
