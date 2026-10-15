import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, parseItem, parsePost } from './utils';

const handler = async (ctx): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit = Math.min(getRouteLimit(ctx, 10), 100);
    const isNumericCategory = !Number.isNaN(Number(category));

    const categoryResponse = await ofetch(`${baseUrl}/wp-json/wp/v2/categories${isNumericCategory ? `/${category}` : ''}`, {
        query: {
            slug: isNumericCategory ? undefined : category,
        },
    });

    if (Array.isArray(categoryResponse) && !categoryResponse.length) {
        throw new InvalidParameterError(`Category "${category}" not found`);
    }
    const categoryInfo = isNumericCategory ? categoryResponse : categoryResponse[0];
    if (!categoryInfo.id) {
        throw new InvalidParameterError(`Category "${category}" not found`);
    }

    const postsResponse = await parsePost(limit, categoryInfo.id);
    const items = parseItem(postsResponse);
    const image = categoryInfo.yoast_head_json.og_image?.[0]?.url;

    return {
        title: categoryInfo.yoast_head_json.title,
        description: categoryInfo.yoast_head_json.og_site_name,
        image,
        logo: image,
        icon: image,
        link: categoryInfo.link,
        language: 'zh-TW',
        item: items,
    };
};

export const route: Route = {
    name: '分類',
    maintainers: ['TonyRL'],
    example: '/tfc-taiwan/category/weekly-top-ten-rumors',
    path: '/category/:category',
    parameters: {
        category: '分類，見下表',
    },
    handler,
    url: 'tfc-taiwan.org.tw/category/rumor-mill/',
    description: `| 謠言風向球 | 議題觀察室        | TOP10                 | 名家專欄       | 國際視野             |
| ---------- | ----------------- | --------------------- | -------------- | -------------------- |
| rumor-mill | issue-observatory | weekly-top-ten-rumors | expert-columns | research-and-updates |`,
};
