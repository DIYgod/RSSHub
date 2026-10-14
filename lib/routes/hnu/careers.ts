import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/careers',
    categories: ['university'],
    example: '/hnu/careers',
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
            source: ['scc.hnu.edu.cn/module/careers', 'scc.hnu.edu.cn/'],
            target: '/careers',
        },
    ],
    name: '校园招聘',
    maintainers: ['ningyougan'],
    handler,
    url: 'scc.hnu.edu.cn/module/careers',
};

async function handler() {
    const rootUrl = 'http://scc.hnu.edu.cn/';
    // The recruitment page fetches its first page from the public careers API.
    const currentRoute = `${rootUrl}module/getcareers`;
    const currentUrl = `${currentRoute}?start_page=1&type=inner&day=&count=20&start=1`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const companies = response.data.data;

    return {
        title: '校园招聘',
        link: `${rootUrl}module/careers?menu_id=3231`,
        item: companies.map((company) => {
            const ret = {
                title: company.company_name,
                link: `${rootUrl}detail/career?id=${company.career_talk_id}`,
                description: company.address + ' - ' + [company.meet_day, company.meet_time].filter(Boolean).join(' ') + ' - ' + company.professionals,
                category: company.company_property + ' - ' + company.city_name,
            };
            return ret;
        }),
    };
}
