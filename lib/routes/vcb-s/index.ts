import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/post';

const rootUrl = 'https://vcb-s.com';
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

export const route: Route = {
    path: '/',
    categories: ['anime'],
    example: '/vcb-s',
    radar: [
        {
            source: ['vcb-s.com/'],
            target: '',
        },
    ],
    name: '最新文章',
    maintainers: ['cxfksword'],
    handler,
    url: 'vcb-s.com/',
};

async function handler(ctx) {
    const limit = Math.min(getRouteLimit(ctx, 7), 100);
    const url = `${postsAPIUrl}?per_page=${limit}&_embed`;

    const response = await got.get(url);
    const data = JSON.parse(response.body.trim());

    const items = data.map((item) => {
        const description = renderDescription({
            post: item.content.rendered.replaceAll(/<pre class="js-medie-info-detail[^>]*>(.*?)<\/pre>/gs, '<pre><code>$1</code></pre>').replaceAll(/<div.+?dw-box-download[^>]+>(.*?)<\/div>/gs, '<pre>$1</pre>'),
            medias: item._embedded['wp:featuredmedia'],
        });

        return {
            title: item.title.rendered,
            link: item.link,
            description,
            pubDate: parsePublicationDate(item.date_gmt),
            author: item._embedded.author[0].name,
        };
    });

    return {
        title: 'VCB-Studio - 大家一起实现的故事！',
        link: rootUrl,
        item: items,
    };
}

function parsePublicationDate(value?: string) {
    if (typeof value !== 'string' || !value) {
        return;
    }
    const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d{1,3})?(?:Z|\+00:00)?$/.exec(value);
    if (!match || !Number.isFinite(parseDate(match[1], 'YYYY-MM-DDTHH:mm:ss', true).getTime())) {
        return;
    }
    const date = parseDate(value.endsWith('Z') || value.endsWith('+00:00') ? value : `${value}Z`);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
