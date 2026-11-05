import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const rootUrl = 'http://job.hrbeu.edu.cn';

export const route: Route = {
    path: '/job/calendar',
    categories: ['university'],
    example: '/hrbeu/job/calendar',
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
            source: ['job.hrbeu.edu.cn/*'],
        },
    ],
    name: '就业服务平台',
    maintainers: ['Derekmini'],
    handler,
    url: 'job.hrbeu.edu.cn',
    description: `| 通知公告 | 热点新闻 |
| :------: | :------: |
|   tzgg   |   rdxw   |

#### 大型招聘会 {#ha-er-bin-gong-cheng-da-xue-jiu-ye-fu-wu-ping-tai-da-xing-zhao-pin-hui}

#### 今日招聘会 {#ha-er-bin-gong-cheng-da-xue-jiu-ye-fu-wu-ping-tai-jin-ri-zhao-pin-hui}`,
};

async function handler() {
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
    const response = await ofetch(`${rootUrl}/f/recruitmentFair/ajax_calendar_list`, {
        query: { time: today.slice(0, 7) },
    });
    if (response.state !== 1) {
        throw new Error(`The employment website returned an error: ${response.msg}`);
    }
    return {
        title: '今日招聘会',
        link: rootUrl,
        item: response.data
            .filter((item) => item.startTimeFormat === today)
            .map((item) => ({
                title: item.title,
                link: new URL(item.url, rootUrl).href,
                guid: item.id,
                description: `<p>时间：${item.startTime} - ${item.endTime}</p><p>地点：${item.field}</p>`,
            })),
    };
}
