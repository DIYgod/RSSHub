import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/interview/:jobId',
    categories: ['bbs'],
    example: '/nowcoder/interview/11200',
    parameters: {
        jobId: '岗位 ID，如 11200（全部）、11002（Java）',
    },
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
            source: ['www.nowcoder.com/interview/'],
        },
    ],
    name: '牛客面试经验',
    description: `牛客面试经验`,
    maintainers: ['xia0ne'],
    handler,
    url: 'nowcoder.com/',
};
async function handler(ctx) {
    const jobId = ctx.req.param('jobId');

    const link = `https://gw-c.nowcoder.com/api/sparta/job-experience/experience/job/list?_=${Date.now()}`;
    const payload = {
        jobId,
        level: 3,
        order: 3,
        page: 1,
    };

    const responseBody = (await got.post(link, { json: payload })).data;
    if (responseBody.code !== 0) {
        throw new Error(`接口错误，错误代码:${responseBody.code},错误原因:${responseBody.msg}`);
    }

    const items = (responseBody.data.records ?? [])
        .map((r) => r?.momentData)
        .filter((m) => m?.uuid)
        .map((m) => ({
            title: m.title || m.content || '面经',
            description: m.content ?? '',
            link: `https://www.nowcoder.com/feed/main/detail/${m.uuid}`,
            pubDate: parseDate(m.createdAt),
        }));

    return {
        title: '牛客网-面试经验',
        link: 'https://www.nowcoder.com/interview/',
        description: '牛客网面试经验',
        item: items,
    };
}
