import { Data, Route } from '@/types';
import { baseUrl, extractNews } from './utils';

import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

export const route: Route = {
    path: '/monthlyMagazine',
    example: '/visionias/monthlyMagazine',
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
            source: ['visionias.in/current-affairs/monthly-magazine'],
            target: '/monthlyMagazine',
        },
    ],
    name: 'Monthly Magazine',
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(): Promise<Data> {
    const response = await ofetch(`${baseUrl}/current-affairs/monthly-magazine`);

    const items = await processNews(response);

    return {
        title: 'Monthly Magazine | Vision IAS',
        link: `${baseUrl}/current-affairs/monthly-magazine`,
        description:
            'Monthly Magazine from Vision IAS provides a comprehensive overview of current affairs, covering significant events and developments across various sectors. It is designed to help aspirants stay updated with the latest happenings, enhancing their preparation for competitive exams.',
        language: 'en',
        item: items,
        image: `${baseUrl}/current-affairs/images/news-today-logo.svg`,
        icon: `https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png`,
        logo: `https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png`,
        allowEmpty: true,
    };
}

async function processNews(page) {
    const $ = load(page);
    const divItems = $(`#monthly-table-of-content>div`).toArray();
    const linkItems: { title: string; link: string }[] = [];
    for (const item of divItems) {
        const maintitle = $(item).find('button>div:nth-child(2) div.text-left').text().trim();
        const links = $(item)
            .find('div>ul>li')
            .toArray()
            .map((li) => {
                const itemTitle = $(li).find('a').text().trim();
                const link = $(li).find('a').attr('href')?.trim() || '';
                return { title: `${itemTitle} - ${maintitle}`, link };
            });
        for (const { title, link } of links) {
            linkItems.push({ title, link: link.includes('https://') ? link : `${baseUrl}${link}` });
        }
    }
    const newsPromises = await Promise.allSettled(linkItems.map((item) => extractNews(item, 'main > div > div.flex.flex-col> div.flex.flex-col.w-full.mt-10')));
    const finalItems: any = [];
    for (const news of newsPromises) {
        if (news.status === 'fulfilled') {
            finalItems.push(...(Array.isArray(news.value) ? news.value : [news.value]));
        } else {
            finalItems.push({
                title: 'Error Parse News',
            });
        }
    }
    return finalItems;
}
