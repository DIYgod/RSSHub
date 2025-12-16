import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/interview/:jobId',
    categories: ['bbs'],
    example: '/nowcoder/interview/11200?page=1',
    parameters: {
        jobId: `
    (必须)岗位ID, example:
11200: 全部
11002: Java
        `,
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
            source: ['https://www.nowcoder.com/interview/'],
        },
    ],
    name: '牛客面试经验',
    description: `牛客面试经验
可选参数：
- page (query 表示是第几页)
- companyList(query 公司列表，逗号分隔 example: 134,138
    `,
    maintainers: ['xia0ne'],
    handler,
    url: 'nowcoder.com/',
};
async function handler(ctx) {
    const jobId = ctx.req.param('jobId');
    const page = ctx.req.query('page') ?? '1';
    const companyParam = ctx.req.query('companyList'); // string | undefined

    const companyList = companyParam
        ? companyParam
              .split(',')
              .map((c) => Number(c.trim()))
              .filter((n) => !Number.isNaN(n))
        : [];
    const link = `https://gw-c.nowcoder.com/api/sparta/job-experience/experience/job/list?_=${Date.now()}`;
    const payload = {
        companyList,
        jobId,
        level: 3,
        order: 3,
        page,
    };
    const responseBody = (
        await got.post(link, {
            json: payload,
        })
    ).data;
    if (responseBody.code !== 0) {
        throw new Error(`接口错误，错误代码:${responseBody.code},错误原因:${responseBody.msg}`);
    }
    const data = responseBody.data.records;
    const items = (data ?? [])
        .map((r) => r?.momentData)
        .filter(Boolean)
        .map((m) => ({
            title: m.title ?? m.content?.slice(0, 60) ?? '面经',
            description: m.content ?? '',
            link: m.uuid ? `https://www.nowcoder.com/feed/main/detail/${m.uuid}` : 'https://www.nowcoder.com/interview/',
        }));

    return {
        title: '牛客网-面试经验',
        link: 'https://www.nowcoder.com/interview/',
        description: '面试经验',
        item: items,
    };
}
