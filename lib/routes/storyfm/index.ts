import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/index',
    categories: ['multimedia'],
    example: '/storyfm/index',
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
            source: ['storyfm.cn/'],
        },
    ],
    name: '首页',
    maintainers: ['sanmmm'],
    handler,
    url: 'storyfm.cn/',
};

async function handler() {
    const url = 'http://storyfm.cn';
    const response = await got(url);
    const $ = load(response.data);
    const cnMonth = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
    const items = $('.isotope > .isotope-item')
        .toArray()
        .map((ele) => {
            const $item = load(ele);
            const img = $item('.isotope-img-container img').attr('src');
            const infoNode = $item('.isotope-index-text').first();
            const title = infoNode.find('.soundbyte-podcast-progression-title');
            const link = infoNode.find('a.soundbyte-podcast-play-progression').attr('href');
            const time = infoNode.find('.fa-clock-o').text();
            const date = infoNode.find('.soundbyte-podcast-date-progression').text();
            const [month, day, year] = date
                .replace(',', '')
                .split(' ')
                .map((value) => {
                    if (value.includes('月')) {
                        const enMongth = cnMonth.findIndex((cnMonthStr) => value.includes(cnMonthStr));
                        value = enMongth + 1;
                    }
                    return value;
                });

            const pubDate = new Date(`${year}-${month}-${day} ${time}`).toUTCString();
            return {
                title,
                description: [`<img src="${img}"/>`, title].join('<br/>'),
                link,
                pubDate,
            };
        });
    return {
        title: '故事说FM',
        description: '故事说FM',
        link: url,
        item: items,
    };
}
