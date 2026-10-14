import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
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
            source: ['research.ke.com/ResearchResults'],
            target: '/researchResults',
        },
    ],
    name: '研究成果',
    maintainers: ['shaomingbo'],
    handler,
    url: 'research.ke.com/ResearchResults',
};

async function handler() {
    const response = await ofetch.raw('https://research.ke.com/apis/consumer-access/index/contents/page', {
        method: 'POST',
        headers: {
            Referer: 'https://research.ke.com/ResearchResults',
        },
        body: {
            pageIndex: 1,
            pageSize: 9,
        },
    });
    const list = response._data?.data?.list;
    if (!Array.isArray(list)) {
        throw new TypeError('The research API did not return a report list. Check that the source is available.');
    }

    return {
        title: '房地产行业研究报告',
        link: 'https://research.ke.com/ResearchResults',
        description: '研究成果',
        item: list.map((item) => ({
            title: item.title,
            link: `https://research.ke.com/${item.contentTypeId}/ArticleDetail?id=${item.id}`,
            author: item.author,
            description: item.guideReading,
            pubDate: item.publishTime ? parseDate(item.publishTime) : undefined,
        })),
    };
}
