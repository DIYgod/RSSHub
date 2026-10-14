import { load } from 'cheerio';

import NotFoundError from '@/errors/types/not-found';
import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['other'],
    example: '/aqara/en/category/news',
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

const categoryAliases = {
    'press-release': 'news',
    article: 'blog',
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 50);

    const pageSize = Math.min(limit, 100);

    const rootUrl = 'https://www.aqara.com';
    const apiSlug = 'wp-json/wp/v2';

    let filterName;

    let currentUrl = `${rootUrl}/en/`;
    let apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${pageSize}`, currentUrl).href;

    const filterMatches = (ctx.req.param('path') ?? '').match(/^([^/]*)\/([^/]*)\/(.*)$/);

    if (filterMatches) {
        const filterRegion = filterMatches[1];
        const filterType = filterMatches[2] === 'tag' ? 'tags' : filterMatches[2] === 'category' ? 'categories' : filterMatches[2];
        const filterKeyword = decodeURI(filterMatches[3].split('/').pop());
        const filterSlug = filterType === 'categories' && Object.hasOwn(categoryAliases, filterKeyword) ? categoryAliases[filterKeyword] : filterKeyword;
        const filterApiUrl = `${rootUrl}/${filterRegion}/${apiSlug}/${filterType}?slug=${encodeURIComponent(filterSlug)}`;

        const { data: filterResponse } = await got(filterApiUrl);

        const filter = filterResponse.find((term) => term.slug === filterSlug);
        if (!filter?.id) {
            throw new NotFoundError(`Aqara ${filterType} "${filterKeyword}" was not found in region "${filterRegion}". Use a category or tag from the current official website.`);
        }

        if (filter.id) {
            filterName = filter.name ?? filterKeyword;
            currentUrl = filter.link ?? currentUrl;
            apiUrl = `${rootUrl}/${filterRegion}/${apiSlug}/posts?_embed=true&per_page=${pageSize}&${filterType}=${filter.id}`;
        }
    }

    const { data: response } = await got(apiUrl);

    const items = response.slice(0, limit).map((item) => {
        const terminologies = item._embedded['wp:term'];

        const content = load(item.content?.rendered ?? item.content);

        // To handle lazy-loaded images.

        content('figure img').each((_, el) => {
            const image = content(el);
            const imageSrc = image.prop('data-actualsrc') ?? image.prop('data-original') ?? image.prop('src');
            if (!imageSrc) {
                return;
            }
            image.attr('src', imageSrc.replace(/(-\d+x\d+)/, ''));
            const width = image.prop('data-rawwidth') ?? image.prop('width');
            const height = image.prop('data-rawheight') ?? image.prop('height');
            if (width) {
                image.attr('width', width);
            }
            if (height) {
                image.attr('height', height);
            }
        });

        return {
            title: item.title?.rendered ?? item.title,
            link: item.link,
            description: content.html(),
            author: item._embedded.author.map((a) => a.name).join('/'),
            category: terminologies.flat().map((c) => c.name),
            guid: item.guid?.rendered ?? item.guid,
            pubDate: item.date_gmt ? parseDate(`${item.date_gmt}Z`) : undefined,
            updated: item.modified_gmt ? parseDate(`${item.modified_gmt}Z`) : undefined,
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const icon = $('link[rel="apple-touch-icon"]').prop('href');
    const title = $('meta[property="og:site_name"]').prop('content') ?? 'Aqara';

    return {
        item: items,
        title: `${title}${filterName ? ` - ${filterName}` : ''}`,
        link: currentUrl,
        description: $('meta[property="og:title"]').prop('content'),
        language: $('meta[property="og:locale"]').prop('content')?.replace('_', '-') as Language,
        image: $('meta[name="msapplication-TileImage"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="og:type"]').prop('content'),
        author: title,
    };
}
