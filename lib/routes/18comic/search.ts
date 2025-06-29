import { Route } from '@/types';
import { apiMapCategory, defaultDomain, getApiUrl, getRootUrl, ProcessApiItems, ProcessItems } from './utils';
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

async function handlerApiWithPage(params, page, total, fetchedTotal, filteredTotal) {
    const { domain, limit, rootUrl, keyword, category, order } = params;
    const results: any[] = [];
    let apiUrl = getApiUrl();
    apiUrl = `${apiUrl}/search?search_query=${keyword}&o=${order}&page=${page}`;
    let apiResult = await ProcessApiItems(apiUrl);
    total ??= apiResult.total;
    const fetchItemsLength = apiResult.content.length;
    fetchedTotal += fetchItemsLength;
    let filteredItemsByCategory = apiResult.content;
    // Filter items by category if not 'all'
    if (category !== 'all') {
        filteredItemsByCategory = apiResult.content.filter((item) => item.category.title === apiMapCategory(category));
    }
    filteredItemsByCategory = filteredItemsByCategory.slice(0, limit - filteredTotal);
    filteredTotal = filteredTotal + filteredItemsByCategory.length;
    const tempResults = await Promise.all(
        filteredItemsByCategory.map((item) =>
            cache.tryGet(item.id, async () => {
                const tempResult = {};
                tempResult.title = item.name;
                tempResult.link = `${rootUrl}/album/${item.id}`;
                tempResult.guid = `18comic:/album/${item.id}`;
                tempResult.updated = parseDate(item.update_at);
                apiUrl = `${getApiUrl()}/album?id=${item.id}`;
                apiResult = await ProcessApiItems(apiUrl);
                tempResult.pubDate = new Date(apiResult.addtime * 1000);
                tempResult.category = apiResult.tags.map((tag) => tag);
                tempResult.author = apiResult.author.map((a) => a).join(', ');
                tempResult.description = art(path.join(__dirname, 'templates/description.art'), {
                    introduction: apiResult.description,
                    images: [
                        `https://cdn-msp3.${domain}/media/albums/${item.id}_3x4.jpg`,
                        // 取得的预览图片会被分割排序，所以先只取封面图
                        // `https://cdn-msp3.${domain}/media/photos/${item.id}/00001.webp`,
                        // `https://cdn-msp3.${domain}/media/photos/${item.id}/00002.webp`,
                        // `https://cdn-msp3.${domain}/media/photos/${item.id}/00003.webp`,
                    ],
                    cover: `https://cdn-msp3.${domain}/media/albums/${item.id}_3x4.jpg`,
                    category: tempResult.category,
                });
                return tempResult;
            })
        )
    );
    results.push(...tempResults);

    if (fetchedTotal < (total ?? 0) && filteredTotal < limit) {
        const nextPageResult = await handlerApiWithPage(params, page + 1, total, fetchedTotal, filteredTotal);
        results.push(...nextPageResult);
    }
    return results;
}

async function handlerForApi(params) {
    const { currentUrl, keyword } = params;
    const results: any[] = [];
    const total = null;
    const fetchedTotal = 0;
    const filteredTotal = 0;
    results.push(...(await handlerApiWithPage(params, 1, total, fetchedTotal, filteredTotal)));
    return {
        title: `Search Results For '${keyword}' - 禁漫天堂`,
        link: currentUrl.replace(/\?$/, ''),
        item: results,
        allowEmpty: true,
    };
}

async function handler(ctx) {
    const option = ctx.req.param('option') ?? 'photos';
    const category = ctx.req.param('category') ?? 'all';
    const keyword = ctx.req.param('keyword') ?? '';
    const time = ctx.req.param('time') ?? 'a';
    const order = ctx.req.param('order') ?? 'mr';
    const { domain = defaultDomain } = ctx.req.query();
    const { api = false } = ctx.req.query();
    const rootUrl = getRootUrl(domain);
    const currentUrl = `${rootUrl}/search/${option}${category === 'all' ? '' : `/${category}`}${keyword ? `?search_query=${keyword}` : '?'}${time === 'a' ? '' : `&t=${time}`}${order === 'mr' ? '' : `&o=${order}`}`;
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20;
    if (api) {
        return await handlerForApi({ domain, limit, currentUrl, rootUrl, keyword, category, order, page: 1 });
    }

    return await ProcessItems(ctx, currentUrl, rootUrl);
}
