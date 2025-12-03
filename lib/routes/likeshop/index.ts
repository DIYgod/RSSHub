import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:site',
    categories: ['social-media'],
    example: '/likeshop/bloombergpursuits',
    parameters: { site: 'the site attached to likeshop.me/' },
    radar: [
        {
            source: ['likeshop.me/'],
        },
    ],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Posts',
    maintainers: ['nickyfoto'],
    handler,
    description: 'LikeShop link in bio takes your audience from Instagram and TikTok to your website in one easy step.',
};

async function handler(ctx) {
    const site = ctx.req.param('site');
    const link = `https://api.likeshop.me/api/accounts/${site}/galleries/likeshop`;
    const data = await ofetch(link);
    const items = data.data.media.map((item) => ({
        title: item.comment,
        link: item.product_url.split('?')[0],
        description: `<p><img src="${item.image_url.split('?')[0]}"></p>`,
        guid: item.id,
    }));
    return {
        title: `@${site} Likeshop`,
        link: `https://likeshop.me/${site}`,
        item: items,
    };
}
