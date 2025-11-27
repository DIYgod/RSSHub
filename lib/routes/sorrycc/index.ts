import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Post } from './types';

const WORDPRESS_HASH = 'f05fca638390aed897fbe3c2fff03000';

export const route: Route = {
    name: '文章',
    categories: ['blog'],
    path: '/',
    example: '/sorrycc',
    radar: [
        {
            source: ['sorrycc.com'],
        },
    ],
    handler,
    maintainers: ['KarasuShin'],
    view: ViewType.Articles,
    features: {
        supportRadar: true,
        requireConfig: [
            {
                name: 'SORRYCC_COOKIES',
                description: `登录用户的Cookie,获取方式：\n1. 登录sorrycc.com\n2. 打开浏览器开发者工具，切换到 Application 面板\n3. 点击侧边栏中的Storage -> Cookies -> https://sorrycc.com\n4. 复制 Cookie 中的 wordpress_logged_in_${WORDPRESS_HASH} 值`,
                optional: true,
            },
        ],
    },
    description: '云谦的博客，部分内容存在权限校验，访问完整内容请部署RSSHub私有实例并配置授权信息',
};

async function handler(ctx: Context): Promise<Data> {
    const host = 'https://sorrycc.com';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 100;
    const cookie = config.sorrycc.cookie;

    const data = await ofetch<Post[]>(`${host}/wp-json/wp/v2/posts?per_page=${limit}`);

    const items: DataItem[] = await Promise.all(
        data.map(async (item) => {
            const title = item.title.rendered;
            const link = item.link;
            const pubDate = parseDate(item.date_gmt);
            const updated = parseDate(item.modified_gmt);
            if (item.categories.includes(7) && cookie) {
                return (await cache.tryGet(link, async () => {
                    const article = await ofetch(link, {
                        headers: {
                            Cookie: `wordpress_logged_in_${WORDPRESS_HASH}=${cookie}`,
                        },
                    });
                    const $article = load(article);
                    const description = $article('.content').html();
                    return {
                        title,
                        description,
                        link,
                        pubDate,
                        updated,
                    };
                })) as unknown as DataItem;
            }
            return {
                title,
                description: item.content.rendered,
                link,
                pubDate,
                updated,
            } as DataItem;
        })
    );

    return {
        title: '文章',
        item: items,
        link: host,
        image: `${host}/wp-content/uploads/2024/01/cropped-CC-1-32x32.png`,
    };
}
