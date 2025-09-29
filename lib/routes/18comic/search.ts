import { Route } from '@/types';
import { apiMapCategory, defaultDomain, getApiUrl, getRootUrl, processApiItems } from './utils';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/search/:option?/:category?/:keyword?/:time?/:order?',
    categories: ['anime'],
    example: '/18comic/search/photos/all/NTR',
    parameters: {
        option: '选项，可选 `video` 和 `photos`，默认为 `photos`',
        category: '分类，同上表，默认为 `all` 即全部',
        keyword: '关键字，同上表，默认为空',
        time: '时间范围，同上表，默认为 `a` 即全部',
        order: '排列顺序，同上表，默认为 `mr` 即最新',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['jmcomic.group/'],
            target: '/:category?/:time?/:order?/:keyword?',
        },
    ],
    name: '搜索',
    maintainers: [],
    handler,
    url: 'jmcomic.group/',
    description: `::: tip
  关键字必须超过两个字，这是来自网站的限制。
:::`,
};

async function handler(ctx) {
    const option = ctx.req.param('option') ?? 'photos';
    const category = ctx.req.param('category') ?? 'all';
    const keyword = ctx.req.param('keyword') ?? '';
    const time = ctx.req.param('time') ?? 'a';
    const { domain = defaultDomain } = ctx.req.query();
    const rootUrl = getRootUrl(domain);
    let order = ctx.req.param('order') ?? 'mr';
    const currentUrl = `${rootUrl}/search/${option}${category === 'all' ? '' : `/${category}`}${keyword ? `?search_query=${keyword}` : '?'}${time === 'a' ? '' : `&t=${time}`}${order === 'mr' ? '' : `&o=${order}`}`;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;

    let apiUrl = getApiUrl();
    order = time === 'a' ? order : `${order}_${time}`;
    apiUrl = `${apiUrl}/search?search_query=${keyword}&o=${order}`;
    let apiResult = await processApiItems(apiUrl);
    let filteredItemsByCategory = apiResult.content;
    // Filter items by category if not 'all'
    if (category !== 'all') {
        filteredItemsByCategory = apiResult.content.filter((item) => item.category.title === apiMapCategory(category));
    }
    filteredItemsByCategory = filteredItemsByCategory.slice(0, limit);
    const results = await Promise.all(
        filteredItemsByCategory.map((item) =>
            cache.tryGet(`18comic:search:${item.id}`, async () => {
                const result = {};
                result.title = item.name;
                result.link = `${rootUrl}/album/${item.id}`;
                result.guid = `18comic:/album/${item.id}`;
                result.updated = parseDate(item.update_at);
                apiUrl = `${getApiUrl()}/album?id=${item.id}`;
                apiResult = await processApiItems(apiUrl);
                result.pubDate = new Date(apiResult.addtime * 1000);
                result.category = apiResult.tags.map((tag) => tag);
                result.author = apiResult.author.map((a) => a).join(', ');
                result.description = art(path.join(__dirname, 'templates/description.art'), {
                    introduction: apiResult.description,
                    images: [
                        `https://cdn-msp3.${domain}/media/albums/${item.id}_3x4.jpg`,
                        // 取得的预览图片会被分割排序，所以先只取封面图
                        // `https://cdn-msp3.${domain}/media/photos/${item.id}/00001.webp`,
                        // `https://cdn-msp3.${domain}/media/photos/${item.id}/00002.webp`,
                        // `https://cdn-msp3.${domain}/media/photos/${item.id}/00003.webp`,
                    ],
                    cover: `https://cdn-msp3.${domain}/media/albums/${item.id}_3x4.jpg`,
                    category: result.category,
                });
                return result;
            })
        )
    );

    return {
        title: `Search Results For '${keyword}' - 禁漫天堂`,
        link: currentUrl.replace(/\?$/, ''),
        item: results,
        allowEmpty: true,
    };
}
