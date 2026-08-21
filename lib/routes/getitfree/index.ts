import { load } from 'cheerio';

import type { Route } from '@/types';
import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { apiSlug, bakeFilterSearchParams, bakeFiltersWithPair, bakeUrl, fetchData, getFilterNameForTitle, getFilterParamsForUrl, parseFilterStr, rootUrl } from './util';

export const route: Route = {
    path: '/category/:id{.+}?',
    categories: ['shopping'],
    example: '/getitfree/category/pc',
    parameters: { id: '分类，见下表，可在对应分类页中找到，默认为所有类别' },
    radar: [
        {
            source: ['getitfree.cn/category/:id'],
            target: '/category/:id',
        },
    ],
    name: '分类',
    maintainers: ['sanmmm', 'nczitzk'],
    handler,
    url: 'getitfree.cn',
    description: `::: tip
可以叠加使用得到分类结果并集，如 [\`/getitfree/category/pc,android\`](https://rsshub.app/getitfree/category/pc,android)

亦可与标签组合使用，如 [\`/getitfree/category/pc/tag/ai\`](https://rsshub.app/getitfree/category/pc/tag/ai)
:::

| 所有类别 | Android | iOS | Mac | PC | UWP | 公告         | 永久免费 | 限时免费 | 正版折扣 |
| -------- | ------- | --- | --- | -- | --- | ------------ | -------- | -------- | -------- |
|          | android | ios | mac | pc | uwp | notification | free     | giveaway | discount |`,
};

export async function handler(ctx) {
    const filter = getSubPath(ctx).slice(1);
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50;

    const filters = parseFilterStr(filter);
    const filtersWithPair = await bakeFiltersWithPair(filters);

    const searchParams = bakeFilterSearchParams(filters, 'name', false);
    const apiSearchParams = bakeFilterSearchParams(filtersWithPair, 'id', true);

    apiSearchParams.append('_embed', 'true');
    apiSearchParams.append('per_page', limit);

    const apiUrl = bakeUrl(`${apiSlug}/posts`, rootUrl, apiSearchParams);
    const currentUrl = bakeUrl(getFilterParamsForUrl(filtersWithPair) ?? '', rootUrl, searchParams);

    const { data: response } = await got(apiUrl);

    const items = (Array.isArray(response) ? response : JSON.parse(response.match(/(\[.*\])$/)[1])).slice(0, limit).map((item) => {
        const terminologies = item._embedded['wp:term'];

        const content = load(item.content?.rendered ?? item.content);

        content('div.mycred-sell-this-wrapper').prevUntil('hr').nextAll().remove();

        return {
            title: item.title?.rendered ?? item.title,
            link: item.link,
            description: content.html(),
            author: item._embedded.author.map((a) => a.name).join('/'),
            category: [...new Set(terminologies.flat().map((c) => c.name))],
            guid: item.guid?.rendered ?? item.guid,
            pubDate: parseDate(item.date_gmt),
            updated: parseDate(item.modified_gmt),
        };
    });

    const subtitle = getFilterNameForTitle(filtersWithPair);

    return {
        ...(await fetchData(currentUrl)),
        item: items,
        title: `Getitfree${subtitle ? ` | ${subtitle}` : ''}`,
    };
}
