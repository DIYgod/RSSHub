import { Route } from '@/types';

import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
const baseUrl = 'https://nautil.us';

export const route: Route = {
    path: '/topic/:tid',
    categories: ['new-media'],
    example: '/nautil/topic/arts',
    parameters: { tid: 'topic' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['nautil.us/topics/:tid'],
        },
    ],
    name: 'Topics',
    maintainers: ['emdoe'],
    handler,
    description: `This route provides a flexible plan with full text content to subscribe specific topic(s) on the Nautilus. Please visit [nautil.us](https://nautil.us) and click \`Topics\` to acquire whole topic list.`,
};

async function handler(ctx) {
    const categoryIdMap = await cache.tryGet('nautil:categories', async () => {
        const { data } = await got(`${baseUrl}/wp-json/wp/v2/categories`, {
            searchParams: {
                per_page: 100,
            },
        });
        return data.map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
        }));
    });

    const { data: list } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            categories: categoryIdMap.find((item) => item.slug === ctx.req.param('tid').toLowerCase()).id,
            per_page: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20,
        },
    });

    const out = list.map((item) => {
        const head = item.yoast_head_json;
        const $ = load(item.content.rendered, null, false);
        // lazyload images
        $('img').each((_, e) => {
            e = $(e);
            e.attr('src', e.attr('data-src') ?? e.attr('srcset'));
            e.attr('src', e.attr('src').split('?')[0]);
            e.removeAttr('data-src');
            e.removeAttr('srcset');
        });
        return {
            title: item.title.rendered,
            author: item.yoast_head_json.author,
            description: art(path.join(__dirname, 'templates/description.art'), {
                head,
                rendered: $.html(),
            }),
            link: item.link,
            pubDate: parseDate(item.date_gmt),
        };
    });

    return {
        title: 'Nautilus | ' + categoryIdMap.find((item) => item.slug === ctx.req.param('tid').toLowerCase()).name,
        link: `${baseUrl}/topics/${ctx.req.param('tid')}/`,
        item: out,
    };
}
