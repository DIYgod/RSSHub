import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/books',
    categories: ['programming'],
    example: '/juejin/books',
    parameters: {},
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
            source: ['juejin.cn/books'],
        },
    ],
    name: '小册',
    maintainers: ['xyqfer'],
    handler,
    url: 'juejin.cn/books',
    description: `> 掘金小册需要付费订阅，RSS 仅做更新提醒，不含付费内容.`,
};

async function handler() {
    const response = await ofetch('https://api.juejin.cn/booklet_api/v1/booklet/listbycategory', {
        method: 'POST',
        body: { category_id: '0', cursor: '0', limit: 20 },
    });

    const items = response.data.map(({ base_info }) => ({
        title: base_info.title,
        link: `https://juejin.cn/book/${base_info.booklet_id}`,
        description: `
            <img src="${base_info.cover_img}"><br>
            <strong>${base_info.title}</strong><br><br>
            ${base_info.summary}<br>
            <strong>价格:</strong> ${base_info.price / 100}元
        `,
        pubDate: parseDate(base_info.ctime * 1000),
        guid: base_info.booklet_id,
    }));

    return {
        title: '掘金小册',
        link: 'https://juejin.cn/books',
        item: items,
    };
}
