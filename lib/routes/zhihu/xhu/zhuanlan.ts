import { Route } from '@/types';
import got from '@/utils/got';
import auth from './auth';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/xhu/zhuanlan/:id',
    categories: ['social-media'],
    example: '/zhihu/xhu/zhuanlan/githubdaily',
    parameters: { id: '专栏 id, 可在专栏主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['zhuanlan.zhihu.com/:id'],
            target: '/zhuanlan/:id',
        },
    ],
    name: 'xhu- 专栏',
    maintainers: ['JimenezLi'],
    handler,
};

async function handler(ctx) {
    const xhuCookie = await auth.getCookie(ctx);
    const id = ctx.req.param('id');
    const link = `https://www.zhihu.com/column/${id}`;

    const titleResponse = await got({
        method: 'get',
        url: `https://api.zhihuvvv.workers.dev/columns/${id}`,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });

    const contentResponse = await got({
        method: 'get',
        url: `https://api.zhihuvvv.workers.dev/columns/${id}/articles?limit=20&offest=0`,
        headers: {
            Referer: 'https://api.zhihuvvv.workers.dev',
            Cookie: xhuCookie,
        },
    });

    const listRes = contentResponse.data.data;

    return {
        title: `知乎专栏-${titleResponse.data.title}`,
        description: titleResponse.data.description,
        link,
        item: listRes.map((item) => {
            let description = '';
            if (item.content) {
                const $ = load(item.content);
                $('img').css('max-width', '100%');
                description = $.html();
            }

            let title = '';
            let link = '';
            let author = '';
            let pubDate;

            // The xhu api only get items of type article.
            switch (item.type) {
                case 'article':
                    title = item.title;
                    link = item.url;
                    author = item.author.name;
                    pubDate = parseDate(item.created * 1000);

                    break;

                case 'answer':
                    title = item.question.title;
                    author = item.question.author ? item.question.author.name : '';
                    link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
                    pubDate = parseDate(item.created_time * 1000);

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
                description,
                author,
                pubDate,
                guid: link,
                link,
            };
        }),
    };
}
