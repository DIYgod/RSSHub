import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

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
    description: `Use the category ID to retrieve a list of articles, category ID.  
From the page source of \`https://techcrunch.com/category/***\`, locate the \`{category_id}\`  
Example:  
\`html\` -> \`head\` -> \`<link rel="alternate" title="JSON" type="application/json" href="https://techcrunch.com/wp-json/wp/v2/categories/{category_id}">\``,
};

async function handler(ctx) {
    const categoryId = ctx.req.param('categoryId');
    const { data } = await got(`${host}/wp-json/wp/v2/posts?categories=${categoryId}`);
    const items = data.map((item) => {
        const head = item.yoast_head_json;
        const $ = load(item.content.rendered, null, false);
        return {
            title: item.title.rendered,
            description: art(path.join(__dirname, 'templates/description.art'), {
                head,
                rendered: $.html(),
            }),
            link: item.link,
            pubDate: parseDate(item.date_gmt),
        };
    });

    return {
        title: 'TechCrunch',
        link: host,
        description: 'Reporting on the business of technology, startups, venture capital funding, and Silicon Valley.',
        item: items,
    };
}
