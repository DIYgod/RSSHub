import type { Route } from '@/types';
import buildData from '@/utils/common-config';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.xunhupay.com';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/xunhupay/blog',
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
            source: ['www.xunhupay.com/blog'],
        },
    ],
    name: '文章',
    maintainers: ['Joey'],
    handler,
    url: 'www.xunhupay.com/blog',
};

async function handler() {
    const link = `${baseUrl}/blog.html`;
    return await buildData({
        link,
        url: link,
        title: '博客',
        description: '虎皮椒-博客',
        item: {
            item: '.blog-post > article',
            title: ($) => $('h5').text(),
            link: ($) => $('a').attr('href'),
            description: ($) => $('.content').text(),
            pubDate: ($) => parseDate($('.date').text(), 'YYYY-MM-DD'),
            guid: ($) => {
                const href = $('a').attr('href');
                return href ? Buffer.from(href).toString('base64') : undefined;
            },
        },
    });
}
