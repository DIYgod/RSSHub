// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

const rootUrl = 'https://vcb-s.com';
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;

export default async (ctx) => {
    const limit = ctx.req.query('limit') ?? 7;
    const url = `${postsAPIUrl}?per_page=${limit}&_embed`;

    const response = await got.get(url);
    if (typeof response.data === 'string') {
        response.data = JSON.parse(response.body.trim());
    }
    const data = response.data;

    const items = data.map((item) => {
        const description = art(path.join(__dirname, 'templates/post.art'), {
            post: item.content.rendered.replaceAll(/<pre class="js-medie-info-detail.*?>(.*?)<\/pre>/gs, '<pre><code>$1</code></pre>').replaceAll(/<div.+?dw-box-download.+?>(.*?)<\/div>/gs, '<pre>$1</pre>'),
            medias: item._embedded['wp:featuredmedia'],
        });

        return {
            title: item.title.rendered,
            link: item.link,
            description,
            pubDate: parseDate(item.date_gmt),
            author: item._embedded.author[0].name,
        };
    });

    ctx.set('data', {
        title: 'VCB-Studio - 大家一起实现的故事！',
        link: rootUrl,
        item: items,
    });
};
