import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getCookieValueByKey, header, processImage } from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/people/answers/:id',
    categories: ['social-media'],
    example: '/zhihu/people/answers/diygod',
    parameters: { id: '作者 id，可在用户主页 URL 中找到' },
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
            source: ['www.zhihu.com/people/:id/answers'],
        },
    ],
    name: '用户回答',
    maintainers: ['DIYgod', 'prnake'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const zc0 = getCookieValueByKey('z_c0');

    const headers = {
        'User-Agent': 'ZhihuHybrid com.zhihu.android/Futureve/6.59.0 Mozilla/5.0 (Linux; Android 10; GM1900 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/85.0.4183.127 Mobile Safari/537.36',
        Referer: `https://www.zhihu.com/people/${id}/answers`,
        Cookie: zc0 ? `z_c0=${zc0}` : '',
    };

    const response = await got({
        method: 'get',
        url: `https://api.zhihu.com/people/${id}/answers?order_by=created&offset=0&limit=10`,
        headers,
    });

    const data = response.data.data;
    let name = data[0].author.name;

    if (name === '知乎用户') {
        const userProfile = await cache.tryGet(`zhihu:profile:${id}`, async () => {
            const apiPath = `/api/v4/members/${id}`;

            const { data } = await got({
                method: 'get',
                url: `https://www.zhihu.com${apiPath}`,
                headers: {
                    ...header,
                    Referer: `https://www.zhihu.com/people/${id}`,
                },
            });
            return data;
        });
        name = userProfile.name;
    }

    const items = await Promise.all(
        data.map(async (item) => {
            let description;
            const link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
            const title = item.question.title;
            try {
                const detail = await got({
                    method: 'get',
                    url: `https://api.zhihu.com/appview/api/v4/answers/${item.id}?include=content&is_appview=true`,
                    headers,
                });
                description = processImage(detail.data.content);
            } catch {
                description = `<a href="${link}" target="_blank">${title}</a>`;
            }
            return {
                title,
                description,
                pubDate: parseDate(item.created_time * 1000),
                link,
            };
        })
    );

    return {
        title: `${name}的知乎回答`,
        link: `https://www.zhihu.com/people/${id}/answers`,
        item: items,
    };
}
