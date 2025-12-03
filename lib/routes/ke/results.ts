import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/researchResults',
    categories: ['other'],
    example: '/ke/researchResults',
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
            source: ['www.research.ke.com/researchResults'],
        },
    ],
    name: '研究成果',
    maintainers: ['shaomingbo'],
    handler,
    url: 'www.research.ke.com/researchResults',
};

async function handler() {
    const response = await got({
        method: 'post',
        url: 'https://research.ke.com/apis/consumer-access/index/contents/page',
        headers: {
            Referer: 'https://research.ke.com/ResearchResults',
        },
        json: {
            pageIndex: 1,
            pageSize: 9,
        },
    });

    const { status, statusMessage, data } = response;
    if (status !== 200) {
        throw new Error(statusMessage);
    }

    const { list } = data.data;

    return {
        title: '房地产行业研究报告',
        link: 'https://research.ke.com/ResearchResults',
        description: '研究成果',
        item: list.map((item) => ({
            title: item.title,
            link: `https://research.ke.com/${item.contentTypeId}/ArticleDetail?id=${item.id}`,
            author: item.author,
            description: item.guideReading,
            pubDate: parseDate(item.publishTime),
        })),
    };
}
