import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/job/jobfairs',
    categories: ['university'],
    example: '/kmust/job/jobfairs',
    name: '双选会',
    maintainers: ['geekrainy'],
    handler,
};

const baseUrl = 'http://job.kmust.edu.cn';

async function handler(): Promise<Data> {
    const pageUrl = `${baseUrl}/module/getjobfairs?start_page=1&keyword=&count=20&start=1&_=${Date.now()}`;
    const data = await ofetch(pageUrl);

    return {
        title: '双选会-昆明理工大学就业网',
        link: `${baseUrl}/module/jobfairs`,
        item: data.data.slice(0, 10).map((item) => {
            const { meet_day: meetDay = '', meet_time: meetTime = '', title = '', school_name: schoolName = '', address = '', fair_id: fairId = '' } = item;
            return {
                title: `【${meetDay} ${meetTime}】${title}`,
                description: `时间：${meetDay} ${meetTime}<br>地点：${schoolName ? `${schoolName}-${address}` : address}`,
                link: `${baseUrl}/detail/jobfair?id=${fairId}`,
            };
        }) as DataItem[],
    };
}
