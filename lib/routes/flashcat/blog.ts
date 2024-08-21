import { Route, Data } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    // TODO
    // radar: [
    //     {
    //         source: ['github.com/:user/:repo/issues', 'github.com/:user/:repo/issues/:id', 'github.com/:user/:repo'],
    //         target: '/issue/:user/:repo',
    //     },
    // ],
    name: 'Flashcat 快猫星云博客',
    maintainers: ['chesha1'],
    handler: handlerRoute,
};

async function handlerRoute(): Promise<Data> {
    const response = await ofetch('https://flashcat.cloud/blog/');
    const $ = load(response);

    // get class post-preview
    const items = $('.post-preview')
        .toArray()
        .map((elem) => {
            const $elem = $(elem);
            return {
                title: $elem.find('.post-title').text(),
                description: $elem.find('.post-content-preview').text(),
                link: $elem.find('a').attr('href'),
                pubDate: parseDate(
                    $elem
                        .find('.post-meta')
                        .text()
                        .match(/on\s+(\w+,\s+\w+\s+\d{1,2},\s+\d{4})/)?.[1] || ''
                ),
                author:
                    $elem
                        .find('.post-meta')
                        .text()
                        .match(/by\s+(.+?)\s+on/)?.[1] || '',
            };
        });

    return {
        title: 'Flashcat 快猫星云博客',
        link: 'https://flashcat.cloud/blog/',
        item: items,
    };
}
