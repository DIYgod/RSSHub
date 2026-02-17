import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import utils from './utils';

export const route: Route = {
    path: '/gov/:pphId',
    categories: ['new-media'],
    example: '/thepaper/gov/63850',
    parameters: { pphId: '政务号 id，可在政务号页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '政务号',
    maintainers: ['occam-7'],
    handler,
};

async function handler(ctx) {
    const { pphId } = ctx.req.param();
    const pageSize = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const response = await ofetch('https://api.thepaper.cn/contentapi/cont/pph/gov', {
        method: 'POST',
        body: {
            pageNum: 1,
            pageSize,
            pphId,
        },
    });

    const list = response.data?.list ?? [];
    const authorName = list[0]?.authorInfo?.sname ?? `政务号 ${pphId}`;
    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));

    return {
        title: `澎湃新闻政务号 - ${authorName}`,
        link: `https://www.thepaper.cn/gov_${pphId}`,
        item: items,
        itunes_author: authorName,
        image: list[0]?.authorInfo?.pic || list[0]?.pic,
    };
}
