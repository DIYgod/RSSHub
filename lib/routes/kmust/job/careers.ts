import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/job/careers/:type?',
    categories: ['university'],
    example: '/kmust/job/careers/inner',
    parameters: { type: '默认为 `inner`' },
    name: '宣讲会',
    maintainers: ['geekrainy'],
    description: `| 校内宣讲会 | 校外宣讲会 |
| ---------- | ---------- |
| inner      | outer      |`,
    handler,
};

const baseUrl = 'http://job.kmust.edu.cn';

async function handler(ctx: Context): Promise<Data> {
    const { type = 'inner' } = ctx.req.param();
    const title = `${type === 'inner' ? '校内宣讲会' : '校外宣讲会'}-昆明理工大学就业网`;
    const pageUrl = `${baseUrl}/module/getcareers?start_page=1&keyword=&type=${type}&day=&count=20&start=1&_=${Date.now()}`;
    const data = await ofetch(pageUrl);

    return {
        title,
        link: `${baseUrl}/module/careers${type === 'outer' ? '?type=outer' : ''}`,
        item: data.data.slice(0, 10).map((item) => {
            const {
                meet_day: meetDay = '',
                meet_time: meetTime = '',
                company_name: companyName = '',
                school_name: schoolName = '',
                address = '',
                company_property: companyProperty = '',
                industry_category: industryCategory = '',
                career_talk_id: careerTalkId = '',
            } = item;
            return {
                title: `【${meetDay} ${meetTime}】${companyName}`,
                description: `时间：${meetDay} ${meetTime}<br>地点：${schoolName ? `${schoolName}-${address}` : address}<br>类别：${companyProperty}<br>行业类别：${industryCategory}`,
                link: `${baseUrl}/detail/career?id=${careerTalkId}`,
            };
        }) as DataItem[],
    };
}
