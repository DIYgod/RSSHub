import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/newest',
    categories: ['programming'],
    example: '/testerhome/newest',
    name: '最新发布',
    maintainers: ['xyqfer'],
    handler,
};

async function handler() {
    const response = await ofetch('https://testerhome.com/topics/last');

    const $ = load(response);
    const resultItem = $('.item-list .topic')
        .toArray()
        .map((elem) => {
            const $item = $(elem);
            const a = $item.find('.title a');
            const title = a.attr('title') ?? '';

            return {
                title,
                link: `https://testerhome.com${a.attr('href')}`,
                description: title,
                pubDate: parseDate($item.find('abbr.timeago').attr('title')!),
            };
        });

    return {
        title: 'TesterHome-最新发布',
        link: 'https://testerhome.com/topics/last',
        description: 'TesterHome软件测试社区，人气最旺的软件测试技术门户，提供软件测试社区交流，测试沙龙。',
        item: resultItem,
    };
}
