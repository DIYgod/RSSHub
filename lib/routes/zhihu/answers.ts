import { Route } from '@/types';
import got from '@/utils/got';
import { header, getSignedHeader } from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/people/answers/:id',
    categories: ['social-media'],
    example: '/zhihu/people/answers/diygod',
    parameters: { id: '作者 id，可在用户主页 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'ZHIHU_COOKIES',
                description: '',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.zhihu.com/people/:id/answers'],
        },
    ],
    name: '用户回答',
    maintainers: ['DIYgod', 'prnake'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    // second: get real data from zhihu
    const apiPath = `/api/v4/members/${id}/answers?limit=7&include=data[*].is_normal,content`;

    const signedHeader = await getSignedHeader(`https://www.zhihu.com/people/${id}`, apiPath);

    const response = await got(`https://www.zhihu.com${apiPath}`, {
        headers: {
            ...header,
            ...signedHeader,
            Referer: `https://www.zhihu.com/people/${id}/activities`,
            // Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js
        },
    });

    const data = response.data.data;
    const items = data.map((item) => {
        const title = item.question.title;
        // let description = processImage(detail.content);
        const url = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
        const author = item.author.name;
        const description = item.content;

        return {
            title,
            author,
            description,
            pubDate: parseDate(item.created_time * 1000),
            link: url,
        };
    });

    return {
        title: `${data[0].author.name}的知乎回答`,
        link: `https://www.zhihu.com/people/${id}/answers`,
        item: items,
    };
}
