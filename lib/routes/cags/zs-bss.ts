import ofetch from '@/utils/ofetch';
import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/zs-bss',
    categories: ['university'],
    example: '/cags/zs-bss',
    features: {
        antiCrawler: false,
        requireConfig: false,
        requirePuppeteer: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    maintainers: ['Chikit'],
    name: '中国地质科学院研究生院博士生招生信息',
    parameters: {
        no_parameters: '该路由无需额外参数',
    },
    radar: [
        {
            source: ['edu.cags.ac.cn/#/dky/list/barId=zs_bss/cmsNavType=1'],
            target: '/zs-bss',
        },
    ],
    handler: async () => {
        const API_URL = 'https://edu.cags.ac.cn/api/cms/cmsNews/pageByCmsNavBarId/zs_bss/1/10/0';
        const MAX_INTRO_LENGTH = 200;

        const response = await ofetch(API_URL);
        const data = response.data;

        const items = data.map((item) => {
            const id = item.id;
            const title = item.title;

            let introduction = item.introduction.replaceAll(/\s+/g, ' ').trim();
            if (introduction.length > MAX_INTRO_LENGTH) {
                introduction = `${introduction.substring(0, MAX_INTRO_LENGTH)}...`;
            }

            let pubDate: Date | null = null;
            if (item.publishDate) {
                pubDate = parseDate(item.publishDate, 'YYYY-MM-DD');
                pubDate = timezone(pubDate, 8);
            }

            const link = `https://edu.cags.ac.cn/#/dky/view/id=${id}/barId=zs_bss`;

            return {
                title,
                description: `<p>${introduction}</p>`,
                link,
                guid: link,
                pubDate,
            };
        });

        return {
            title: '中国地质科学院研究生院博士生招生信息',
            link: 'https://edu.cags.ac.cn/#/dky/list/barId=zs_bss/cmsNavType=1',
            item: items,
        };
    },
};
