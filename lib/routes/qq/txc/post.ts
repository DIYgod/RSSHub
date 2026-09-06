import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/txc/post/:project',
    categories: ['program-update'],
    example: '/qq/txc/post/28564',
    parameters: { project: '产品 ID' },
    name: '兔小巢新帖',
    maintainers: ['Qixingchen'],
    handler,
    url: 'txc.qq.com',
};

async function handler(ctx: Context) {
    const { project } = ctx.req.param();
    const link = `https://support.qq.com/products/${project}`;

    const info = await cache.tryGet(`qq:txc:info:${project}`, async () => {
        const { data } = await ofetch(`https://support.qq.com/api/v1/${project}/products/info`, {
            headers: { Referer: link },
        });
        return data;
    });

    const { data } = await ofetch(`https://support.qq.com/api/v2/${project}/posts/label/show`);

    return {
        title: `${info.product_name} 的兔小巢新帖`,
        link,
        image: info.logo,
        item: Object.values(data).map((item: any) => {
            let title = `${item.nick_name} 的吐槽`;
            let description = item.content;
            if (item.type === 3) {
                // feature request
                const content = JSON.parse(item.content);
                title = content.title;
                description = [content.content, content.solution].filter(Boolean).join('<br>');
            } else if (item.type === 4) {
                // version announcement
                const content = JSON.parse(item.content);
                title = `版本更新 ${content.version}`.trim();
                description = JSON.parse(content.content)
                    .map((section) => (section.title ? `<h3>${section.title}</h3>` : '') + section.detail)
                    .join('');
            }
            return {
                title,
                description: description + item.images.map((image) => `<img src="${image.original_url}">`).join(''),
                pubDate: parseDate(item.created_at_timestamp, 'X'),
                link: `${link}/post/${item.id}`,
            };
        }),
    };
}
