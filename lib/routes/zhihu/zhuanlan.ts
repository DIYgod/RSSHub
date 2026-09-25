import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { generateData as generatePinData } from './pin/utils';
import { processImage } from './utils';

export const route: Route = {
    path: '/zhuanlan/:id',
    categories: ['social-media'],
    example: '/zhihu/zhuanlan/googledevelopers',
    parameters: { id: '专栏 id，可在专栏主页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
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

async function handler(ctx) {
    const id = ctx.req.param('id');
    // 知乎专栏链接存在两种格式, 一种以 'zhuanlan.' 开头, 另一种新增的以 'c_' 结尾
    let url = `https://zhuanlan.zhihu.com/${id}`;
    if (id.startsWith('c_')) {
        url = `https://www.zhihu.com/column/${id}`;
    }

    const get = (path = '') => ofetch(`https://zhuanlan.zhihu.com/api/columns/${id}${path}`, { parseResponse: JSON.parse });
    const [column, listRes, pinnedRes] = await Promise.all([get(), get('/items'), get('/pinned-items/v2')]);
    const list = [...listRes.data, ...pinnedRes.data];

    const item = list.map((item) => {
        if (item.type === 'pin') {
            return generatePinData([item])[0];
        }

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
                pubDate = parseDate(item.created_time, 'X');

                break;

            case 'article':
                title = item.title;
                link = item.url;
                author = item.author.name;
                pubDate = parseDate(item.created, 'X');

                break;

            case 'zvideo':
                // 如果类型是zvideo，id即为视频地址参数
                title = item.title;
                link = `https://www.zhihu.com/zvideo/${item.id}`;
                author = item.author.name;
                pubDate = parseDate(item.created_at, 'X');
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
        description: column.description,
        item,
        title: `知乎专栏-${column.title}`,
        link: url,
        image: column.image_url.split('?', 1)[0],
    };
}
