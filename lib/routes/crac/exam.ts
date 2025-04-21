import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/exam',
    categories: ['government'],
    example: '/exam',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '中国无线电协会业余无线电分会-考试信息',
    maintainers: ['admxj'],
    handler,
};

async function handler() {
    const baseUrl = 'http://82.157.138.16:8091/CRAC';

    const response = await got({
        method: 'post',
        url: `${baseUrl}/app/exam_advice/examAdviceList`,
        body: { req: { type: '0', page_no: '1', page_size: '10000' } },
    });

    const list = response.data.res.list.map((item) => {
        const id = Buffer.from(item.id).toString('base64');
        const type = Buffer.from(item.type).toString('base64');
        const link = `${baseUrl}/crac/pages/list_detail.html?id=${id}&type=${type}`;
        return {
            title: item.name,
            link,
            pubDate: item.createDate,
            startDate: item.exam.signUpStartDate,
            examType: item.examType,
            description: item.content,
        };
    });

    return {
        title: '考试信息-中国无线电协会业余无线电分会',
        link: 'http://82.157.138.16:8091/CRAC/crac/pages/list_examMsg.html',
        item: list,
    };
}
