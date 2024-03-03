// @ts-nocheck
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export default async (ctx) => {
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

    ctx.set('data', {
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
    });
};
