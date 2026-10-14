import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/job/bigemploy',
    categories: ['university'],
    example: '/hrbeu/job/bigemploy',
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
    name: '大型招聘会',
    maintainers: ['Derekmini'],
    handler,
    url: 'job.hrbeu.edu.cn',
};

async function handler() {
    const rootUrl = 'http://job.hrbeu.edu.cn';
    const { data } = await got(`${rootUrl}/f/ajaxHome/ajax_findBilateralchosefairLimitList?num=10`);
    if (data.state !== 1) {
        throw new Error(`The employment website returned an error: ${data.msg}`);
    }
    return {
        title: '大型招聘会',
        link: rootUrl,
        item: data.object.map((item) => ({
            title: item.title,
            link: new URL(item.url, rootUrl).href,
            guid: item.id,
            description: `<p>时间：${item.startTime} - ${item.endTime}</p><p>地点：${item.place}</p>`,
        })),
    };
}
