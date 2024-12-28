import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/cybersec-automation/archive',
    radar: [
        {
            source: ['www.cybersec-automation.com'],
        },
    ],
    url: 'www.cybersec-automation.com/',
    name: 'CyberSec Automation',
    maintainers: ['ox01024'],
    handler,
};

async function handler() {
    const response = await ofetch('https://www.cybersec-automation.com/archive');
    const $ = load(response);
    const items = $('div.transparent.h-full.cursor-pointer.overflow-hidden.rounded-sm.flex.flex-col.border').toArray().map((item) => {
        item = $(item);
        return {
            title: item.find('h2').text(),
            link: item.find('.space-y-3 a').attr('href'),
            pubDate: item.find('time').attr('datetime'),
            author: item.find('.flex.items-center span').text(),
            image: item.find('.aspect-social.relative.h-full.overflow-hidden.w-full img').attr('src'),
            description: item.find('.line-clamp-2.sm\\:line-clamp-3.text-md.font-light.wt-body-font').text(),
        };
    });
    return {
        title: 'CyberSec Automation',
        link: 'https://www.cybersec-automation.com/',
        item: items,
        image: 'https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/publication/logo/5579bc25-809d-4fd6-aa79-33da3fd125c3/thumb_CyberSec_Logo.png',
    };
}

