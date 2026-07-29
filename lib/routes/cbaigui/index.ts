import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderFigure } from './templates/figure';
import { apiSlug, GetFilterId, rootUrl } from './utils';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['new-media'],
    example: '/cbaigui',
    parameters: { path: '路径，默认为首页' },
    name: '通用',
    maintainers: ['nczitzk'],
    description: `若订阅 [标签：妖](https://www.cbaigui.com/post-tag/妖)，网址为 \`https://www.cbaigui.com/post-tag/妖\`。截取 \`https://www.cbaigui.com\` 到末尾的部分 \`/post-tag/妖\` 作为参数，此时路由为 [\`/cbaigui/post-tag/妖\`](https://rsshub.app/cbaigui/post-tag/妖)。

若订阅 [分类：埃及](https://www.cbaigui.com/post-category/世界/非洲/埃及)，网址为 \`https://www.cbaigui.com/post-category/世界/非洲/埃及\`。截取 \`https://www.cbaigui.com\` 到末尾的部分 \`/post-category/世界/非洲/埃及\` 作为参数，此时路由为 [\`/cbaigui/post-category/世界/非洲/埃及\`](https://rsshub.app/cbaigui/post-category/世界/非洲/埃及)。

若订阅 [词条：白泽图](https://www.cbaigui.com/post-category/词条/白泽图)，网址为 \`https://www.cbaigui.com/post-category/词条/白泽图\`。截取 \`https://www.cbaigui.com\` 到末尾的部分 \`/post-category/词条/白泽图\` 作为参数，此时路由为 [\`/cbaigui/post-category/词条/白泽图\`](https://rsshub.app/cbaigui/post-category/词条/白泽图)。`,
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50;

    let filterName;

    const path = ctx.req.param('path') ?? '';
    const currentUrl = new URL(`/${path}`, rootUrl).href;
    let apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}`, rootUrl).href;

    const filterMatches = path.match(/^post-(tag|category)\/(.*)$/);

    if (filterMatches) {
        filterName = filterMatches[2].split('/').pop();
        const filterType = filterMatches[1] === 'tag' ? 'tags' : 'categories';
        const filterId = await GetFilterId(filterType, filterName);

        if (filterId) {
            apiUrl = new URL(`${apiSlug}/posts?_embed=true&per_page=${limit}&${filterType}=${filterId}`, rootUrl).href;
        }
    }

    const { data: response } = await got(apiUrl);

    const items = response.slice(0, limit).map((item) => {
        const terminologies = item._embedded['wp:term'];

        const content = load(item.content?.rendered ?? item.content);

        // To handle lazy-loaded images from external sites.

        content('figure').each((_, el) => {
            const image = content(el).find('img');
            const src = image.prop('data-actualsrc') ?? image.prop('data-original');
            const width = image.prop('data-rawwidth');
            const height = image.prop('data-rawheight');

            content(el).replaceWith(
                renderFigure({
                    src,
                    width,
                    height,
                })
            );
        });

        // To remove watermarks on images.

        content('p img').each((_, el) => {
            const image = content(el);
            const src = image.prop('src')!.split('!', 1)[0];
            const width = image.prop('width');
            const height = image.prop('height');

            content(el).replaceWith(
                renderFigure({
                    src,
                    width,
                    height,
                })
            );
        });

        return {
            title: item.title?.rendered ?? item.title,
            link: item.link,
            description: content.html(),
            author: item._embedded.author.map((a) => a.name).join('/'),
            category: [...terminologies[0], ...terminologies[1]].map((c) => c.name),
            guid: item.guid?.rendered ?? item.guid,
            pubDate: parseDate(item.date_gmt),
            updated: parseDate(item.modified_gmt),
        };
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const icon = $('link[rel="apple-touch-icon"]').first().prop('href');

    return {
        item: items,
        title: `纪妖${filterName ? ` - ${filterName}` : ''}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-CN' as Language,
        image: $('meta[name="msapplication-TileImage"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('p.site-description').text(),
        author: $('p.site-title').text(),
    };
}
