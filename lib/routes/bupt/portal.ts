import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/portal',
    categories: ['university'],
    example: '/bupt/portal',
    name: '信息门户',
    maintainers: ['jiaming-shi', 'wzekin'],
    handler,
    features: {
        requireConfig: [
            {
                name: 'BUPT_PORTAL_COOKIE',
                description: '登陆 `https://webapp.bupt.edu.cn/wap/login.html?redirect=http://` 后的 Cookie 值',
            },
        ],
    },
    description: '由于需要登陆 `https://webapp.bupt.edu.cn/wap/login.html?redirect=http://` 后的 Cookie 值，所以只能自建，详情见部署页面的配置模块',
};

async function handler() {
    const cookie = config.bupt.portal_cookie;
    const headers: Record<string, string> = {};
    if (cookie) {
        headers.cookie = cookie;
    }
    const response = await ofetch('https://webapp.bupt.edu.cn/extensions/wap/news/get-list.html?p=1&type=tzgg', { headers });

    const out = Object.values(response.data).flatMap((value: any) =>
        value.map((item) => ({
            title: item.title,
            description: item.text,
            pubDate: parseDate(item.created * 1000),
            link: `https://webapp.bupt.edu.cn/extensions/wap/news/detail.html?id=${item.id}&classify_id=tzgg`,
            author: item.author,
        }))
    );

    return {
        title: '北京邮电大学信息门户',
        link: 'https://webapp.bupt.edu.cn/extensions/wap/news/list.html?p=1&type=tzgg',
        item: out,
    };
}
