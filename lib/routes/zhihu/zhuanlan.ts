import { load } from 'cheerio';

import type { Route } from '@/types';
import { isWorker } from '@/utils/is-worker';
import { parseDate } from '@/utils/parse-date';

import { processImage, withZhihuClient } from './utils';

export const route: Route = {
    path: '/zhuanlan/:id',
    categories: ['social-media'],
    example: '/zhihu/zhuanlan/googledevelopers',
    parameters: { id: '专栏 id，可在专栏主页 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: 'A complete d_c0 and __zse_ck cookie pair skips session initialization. Otherwise Workers use a Playwright browser session; Docker and Vercel generate credentials with JSDOM.',
            },
        ],
        requirePuppeteer: isWorker || process.env.WORKER_BUILD === 'true',
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['zhuanlan.zhihu.com/:id'],
        },
    ],
    name: '专栏',
    maintainers: ['DIYgod'],
    handler,
};

function handler(ctx) {
    const id = ctx.req.param('id');
    // 知乎专栏链接存在两种格式, 一种以 'zhuanlan.' 开头, 另一种新增的以 'c_' 结尾
    let url = `https://zhuanlan.zhihu.com/${id}`;
    if (id.search('c_') === 0) {
        url = `https://www.zhihu.com/column/${id}`;
    }

    return withZhihuClient(url, async (client) => {
        const listRes = await client.get(`/api/v4/columns/${id}/items`);
        const pinnedRes = await client.get(`/api/v4/columns/${id}/pinned-items/v2`);
        const list = [...listRes.data, ...pinnedRes.data];

        const html = await client.getPage();
        const $ = load(html);
        const title = $('.css-zyehvu').text();
        const description = $('.css-1bnklpv').text();

        const item = list.map((item) => {
            // 当专栏内文章内容不含任何文字时, 返回空字符, 以免直接报错
            let description = '';
            if (item.content) {
                description = processImage(item.content);
            }

            let title: string;
            let link: string;
            let author: string;
            let pubDate: Date;

            switch (item.type) {
                case 'answer':
                    title = item.question.title;
                    author = item.question.author ? item.question.author.name : '';
                    link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
                    pubDate = parseDate(item.created_time * 1000);

                    break;

                case 'article':
                    title = item.title;
                    link = item.url;
                    author = item.author.name;
                    pubDate = parseDate(item.created * 1000);

                    break;

                case 'zvideo':
                    // 如果类型是zvideo，id即为视频地址参数
                    title = item.title;
                    link = `https://www.zhihu.com/zvideo/${item.id}`;
                    author = item.author.name;
                    pubDate = parseDate(item.created_at * 1000);
                    // 判断是否存在视频简介
                    description = item.description ? `${item.description} <br> <br> <a href="${link}">视频内容请跳转至原页面观看</a>` : `<a href="${link}">视频内容请跳转至原页面观看</a>`;

                    break;

                default:
                    throw new Error(`Unknown type: ${item.type}`);
            }
            return {
                title,
                link,
                description,
                pubDate,
                author,
            };
        });

        return {
            description,
            item,
            title: `知乎专栏-${title}`,
            link: url,
        };
    });
}
