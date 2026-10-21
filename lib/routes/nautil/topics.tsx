import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const baseUrl = 'https://nautil.us';
const apiUrl = 'https://lede-admin.nautil.us';

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
    description: 'This route provides a flexible plan with full text content to subscribe specific topic(s) on the Nautilus. Please visit [nautil.us](https://nautil.us) and click `Topics` to acquire whole topic list.',
};

async function handler(ctx) {
    const categoryIdMap = await cache.tryGet('nautil:categories', async () => {
        const { data } = await got(`${apiUrl}/wp-json/wp/v2/categories`, {
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

    const { data: list } = await got(`${apiUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            categories: categoryIdMap.find((item) => item.slug === ctx.req.param('tid').toLowerCase()).id,
            per_page: Math.min(getRouteLimit(ctx, 20), 100),
        },
    });

    const out = list.map((item) => {
        const head = item.yoast_head_json;
        const $ = load(item.content.rendered, null, false);
        $('.primis-ad, .article-ad, .editorskit-no-mobile').remove();
        // lazyload images
        $('img').each((_, e) => {
            const $e = $(e);
            const src = $e.attr('data-src') || $e.attr('src') || $e.attr('srcset')?.match(/^\s*(\S+)\s+\d+[wx](?:,|$)/)?.[1];
            if (src) {
                $e.attr('src', src);
            }
            $e.removeAttr('data-src');
            $e.removeAttr('srcset');
        });
        return {
            title: item.title.rendered,
            author: item.yoast_head_json.author,
            description: renderToString(
                <>
                    {head.og_image?.length ? head.og_image.map((image) => <img src={image.url.split('?', 1)[0]} />) : null}
                    {raw($.html())}
                </>
            ),
            link: item.link,
            pubDate: item.date_gmt && item.date_gmt !== '0000-00-00T00:00:00' ? parseDate(`${item.date_gmt}Z`) : undefined,
        };
    });

    return {
        title: 'Nautilus | ' + categoryIdMap.find((item) => item.slug === ctx.req.param('tid').toLowerCase()).name,
        link: `${baseUrl}/topics/${ctx.req.param('tid')}/`,
        item: out,
    };
}
