import { Route } from '@/types';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';

export const route: Route = {
    path: '/hot',
    name: '瀚思彼岸 本周热门',
    url: 'bbs.hassbian.com/forum.php',
    maintainers: ['sidpku'],
    example: '/hassbian/hot',
    parameters: {},
    description: `获取瀚思彼岸的每周热门栏目`,
    categories: ['bbs'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['bbs.hassbian.com'],
            target: '/hot',
        },
    ],
    handler: async () => {
        const baseUrl = 'https://bbs.hassbian.com/';
        const response = await ofetch(`https://bbs.hassbian.com/forum.php`);
        const $ = load(response);
        const items = $('div.threadline_7ree')
            .toArray()
            .map((item) => {
                const a = $(item).find('a').first();
                return {
                    title: a.text(),
                    link: `${baseUrl}${a.attr('href')}`,
                };
            })
            .slice(20, 29);

        return {
            title: `瀚思彼岸 本周热门`,
            link: 'cforum.php',
            item: items,
        };
    },
};

