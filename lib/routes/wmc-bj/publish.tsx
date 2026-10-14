import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/publish/:category{.+}?',
    categories: ['other'],
    example: '/wmc-bj/publish/CRA-Reanalysis/2m-Temperature/6-hour/index.html',
    parameters: {
        category: 'Category, can be found in URL, `CRA-Reanalysis/2m-Temperature/6-hour/index.html` by default',
    },
    name: 'Publish',
    maintainers: ['nczitzk'],
    handler,
    description: `::: tip
\`category\` is the text after \`publish/\` in the URL.

eg. The URL for [Monitoring\\_CMA-RA\\_2m-Temperature\\_6-hour](http://www.wmc-bj.net/publish/CRA-Reanalysis/2m-Temperature/6-hour/index.html) is <http://www.wmc-bj.net/publish/CRA-Reanalysis/2m-Temperature/6-hour/index.html>. The \`category\` for route can be represented as [\`/wmc-bj/publish/CRA-Reanalysis/2m-Temperature/6-hour/index.html\`](https://rsshub.app/wmc-bj/publish/CRA-Reanalysis/2m-Temperature/6-hour/index.html).
:::`,
};

async function handler(ctx) {
    const { category = 'CRA-Reanalysis/2m-Temperature/6-hour/index.html' } = ctx.req.param();

    const rootUrl = 'http://www.wmc-bj.net';
    const currentUrl = new URL(`publish/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const title = $('title').text();
    const author = 'World Meteorological Centre BeiJing';

    const img = $('#imgpath');
    const imageSource = img.prop('src');
    if (!imageSource) {
        throw new Error('No published weather image was found. Check that the category points to a current product page on wmc-bj.net.');
    }
    const datetime = img.attr('data-time');
    const timestamp = (img.attr('data-id') || img.attr('src'))?.match(/_(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\d{3}(?:\.|$)/);
    const sourceDate = timestamp ? `${timestamp[1]}-${timestamp[2]}-${timestamp[3]}T${timestamp[4]}:${timestamp[5]}:${timestamp[6]}Z` : undefined;
    const date = sourceDate ? parseDate(sourceDate) : undefined;
    const pubDate = date && Number.isFinite(date.getTime()) && date.toISOString().replace('.000Z', 'Z') === sourceDate ? date : undefined;
    const categories = $('ol.breadcrumb li')
        .slice(2)
        .toArray()
        .map((b) => $(b).text());

    const items = [
        {
            title: `${datetime} ${title}`,
            link: currentUrl,
            description: renderToString(
                <figure>
                    <img src={imageSource.replace(/\/medium\//, '/')} />
                </figure>
            ),
            category: categories,
            guid: `${currentUrl}#${timestamp ? timestamp.slice(1).join('') : datetime}`,
            pubDate,
        },
    ];

    const image = 'http://image.nmc.cn/static/wmc/img/logo-cma.png';
    const icon = $('link[rel="shortcut icon"]').prop('href');

    return {
        item: items,
        title,
        link: currentUrl,
        language: 'en' as const satisfies Language,
        image,
        icon,
        logo: icon,
        subtitle: categories.join(' > '),
        author,
    };
}
