import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { baseUrl, parsePost, parseItem } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const handler = async (ctx) => {
    const { category } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : undefined;
    const isNumericCategory = !Number.isNaN(Number.parseInt(category, 10));

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

    return {
        title: categoryInfo.yoast_head_json.title,
        description: categoryInfo.yoast_head_json.og_site_name,
        image: categoryInfo.yoast_head_json.og_image[0].url,
        logo: categoryInfo.yoast_head_json.og_image[0].url,
        icon: categoryInfo.yoast_head_json.og_image[0].url,
        link: categoryInfo.link,
        lang: 'zh-TW',
        item: items,
    };
};

export const route: Route = {
    name: '分類',
    maintainers: ['TonyRL'],
    example: '/tfc-taiwan/category/weekly-top-ten-rumors',
    path: '/category/:category',
    parameters: {
        category: '分類，見下表，預設為 `weekly-top-ten-rumors`',
    },
    handler,
    url: 'tfc-taiwan.org.tw/category/rumor-mill/',
    description: `| 謠言風向球 | 議題觀察室        | TOP10                 | 名家專欄       | 國際視野             |
| ---------- | ----------------- | --------------------- | -------------- | -------------------- |
| rumor-mill | issue-observatory | weekly-top-ten-rumors | expert-columns | research-and-updates |`,
};
