import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const baseUrl = 'https://pkmer.cn';

export const route: Route = {
    path: '/recent',
    categories: ['bbs'],
    example: '/pkmer/recent',
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
            source: ['pkmer.cn/page/*'],
        },
    ],
    name: '最近更新',
    maintainers: ['Gnoyong'],
    handler,
    url: 'pkmer.cn/page/*',
};

async function handler() {
    const { data: response } = await got(`${baseUrl}/page/1/`);
    const $ = load(response);
    const items = process($);

    return {
        title: 'PKMer',
        icon: 'https://cdn.pkmer.cn/covers/logo.png!nomark',
        logo: 'https://cdn.pkmer.cn/covers/logo.png!nomark',
        link: baseUrl,
        allowEmpty: true,
        item: items,
    };
}

function process($) {
    const container = $('#pages > div.grid > .relative');
    const items = container.toArray().map((el) => {
        el = $(el);
        const title = el.find('h3');
        return {
            title: title.text().trim(),
            link: baseUrl + title.parent().attr('href'),
            description: el.find('.leading-relaxed').prop('outerHTML') + el.find('.post-content').prop('outerHTML'),
            pubDate: el.find('time').attr('datetime'),
            author: el.find('h4').text().trim(),
            itunes_item_image: el.find('img').attr('src'),
        };
    });
    return items;
}
