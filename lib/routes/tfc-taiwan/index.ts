import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { baseUrl, parsePost, parseItem } from './utils';

const handler = async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : undefined;

    const pageResponse = await ofetch(`${baseUrl}/wp-json/wp/v2/pages/89173`);
    const postsResponse = await parsePost(limit, undefined);

    const pageInfo = pageResponse.yoast_head_json;
    const items = parseItem(postsResponse);

    return {
        title: pageInfo.title,
        description: pageInfo.og_site_name,
        image: pageInfo.og_image[0].url,
        logo: pageInfo.og_image[0].url,
        icon: pageInfo.og_image[0].url,
        link: pageInfo.canonical,
        lang: 'zh-TW',
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
