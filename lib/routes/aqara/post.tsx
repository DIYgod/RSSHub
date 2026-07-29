import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['other'],
    example: '/aqara/en/category/press-release',
    parameters: { path: '路径，默认为首页' },
    description: `路径处填写对应页面 URL 中 \`https://aqara.com/\` 后的字段，形如 \`:region/category/:id\` 或 \`:region/tag/:id\`。

| 参数   | 说明                                                     |
| ------ | -------------------------------------------------------- |
| region | 地区 id，可在对应分类页 URL 中找到，默认为 en，即 Global |
| id     | 分类 id 或标签 id，可在对应分类页或标签页 URL 中找到     |`,
    name: '分类、标签',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://aqara.com';
    const apiSlug = 'wp-json/wp/v2';

    let filterName;

    let currentUrl = rootUrl;
    let apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}`, rootUrl).href;

    const filterMatches = (ctx.req.param('path') ?? '').match(/^([^/]*)\/([^/]*)\/(.*)$/);

    if (filterMatches) {
        const filterRegion = filterMatches[1];
        const filterType = filterMatches[2] === 'tag' ? 'tags' : filterMatches[2] === 'category' ? 'categories' : filterMatches[2];
        const filterKeyword = decodeURI(filterMatches[3].split('/').pop());
        const filterApiUrl = new URL(`${filterRegion}/${apiSlug}/${filterType}?search=${filterKeyword}`, rootUrl).href;

        const { data: filterResponse } = await got(filterApiUrl);

        const filter = filterResponse.pop();

        if (filter?.id ?? undefined) {
            filterName = filter.name ?? filterKeyword;
            currentUrl = filter.link ?? currentUrl;
            apiUrl = new URL(`${filterRegion}/${apiSlug}/posts?_embed=true&per_page=${limit}&${filterType}=${filter.id}`, rootUrl).href;
        }
    }

    const { data: response } = await got(apiUrl);

    const items = response.slice(0, limit).map((item) => {
        const terminologies = item._embedded['wp:term'];

        const content = load(item.content?.rendered ?? item.content);

        // To handle lazy-loaded images.

        content('figure').each((_, el) => {
            const image = content(el).find('img');
            const src = (image.prop('data-actualsrc') ?? image.prop('data-original') ?? image.prop('src')).replace(/(-\d+x\d+)/, '');
            const width = image.prop('data-rawwidth') ?? image.prop('width');
            const height = image.prop('data-rawheight') ?? image.prop('height');

            content(el).replaceWith(
                renderToString(
                    <figure>
                        <img src={src} width={width} height={height} />
                    </figure>
                )
            );
        });

        return {
            title: item.title?.rendered ?? item.title,
            link: item.link,
            description: content.html(),
            author: item._embedded.author.map((a) => a.name).join('/'),
            category: terminologies.flat().map((c) => c.name),
            guid: item.guid?.rendered ?? item.guid,
            pubDate: parseDate(item.date_gmt),
            updated: parseDate(item.modified_gmt),
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const icon = $('link[rel="apple-touch-icon"]').first().prop('href');
    const title = $('meta[property="og:site_name"]').prop('content') ?? 'Aqara';

    return {
        item: items,
        title: `${title}${filterName ? ` - ${filterName}` : ''}`,
        link: currentUrl,
        description: $('meta[property="og:title"]').prop('content'),
        language: $('meta[property="og:locale"]').prop('content'),
        image: $('meta[name="msapplication-TileImage"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="og:type"]').prop('content'),
        author: title,
    };
}
