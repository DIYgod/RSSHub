import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, parseItem, parsePost } from './utils';

const handler = async (ctx): Promise<Data> => {
    const limit = Math.min(getRouteLimit(ctx, 10), 100);

    const pageResponse = await ofetch(`${baseUrl}/wp-json/wp/v2/pages/89173`);
    const postsResponse = await parsePost(limit, undefined);

    const pageInfo = pageResponse.yoast_head_json;
    const image = pageInfo.og_image?.[0]?.url;
    const items = parseItem(postsResponse);

    return {
        title: pageInfo.title,
        description: pageInfo.og_site_name,
        image,
        logo: image,
        icon: image,
        link: pageInfo.canonical,
        language: 'zh-TW',
        item: items,
    };
};

export const route: Route = {
    name: '最新查核報告',
    maintainers: ['TonyRL'],
    example: '/tfc-taiwan',
    path: '/',
    handler,
    url: 'tfc-taiwan.org.tw/latest-news/',
};
