import type { Route } from '@/types';
import buildData from '@/utils/common-config';

const baseUrl = 'https://oct0pu5.cn/';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/oct0pu5',
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
            source: ['oct0pu5.cn'],
            target: '/',
        },
    ],
    name: 'Oct的小破站',
    maintainers: ['octopus058', 'wiketool'],
    handler,
};

async function handler() {
    const link = baseUrl;
    return await buildData({
        link,
        url: link,
        title: `%title%`,
        description: `%description%`,
        params: {
            title: '博客',
            description: 'Oct0pu5的博客',
        },
        item: {
            item: '.recent-posts > .recent-post-item',
            title: `$('.recent-post-info > a').text()`,
            link: `$('.recent-post-info > a').attr('href')`,
            description: `$('.recent-post-info > .content').text()`,
            pubDate: `Date.parse($('div.recent-post-info > div.article-meta-wrap > span.post-meta-date > time').text().trim())`,
        },
    });
}
