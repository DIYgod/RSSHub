import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/blog',
    categories: ['game'],
    example: '/devolverdigital/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['devolverdigital.com/propaganda', 'devolverdigital.com/propaganda/:slug', 'devolverdigital.com/blog'],
        },
    ],
    name: 'Official Blogs',
    maintainers: ['XXY233'],
    handler,
    url: 'devolverdigital.com/propaganda',
};

async function handler() {
    const items = await fetchPage();

    return {
        title: 'DevolverDigital Blog',
        language: 'en-us' as const,
        link: 'https://www.devolverdigital.com/propaganda',
        item: items,
    };
}

async function fetchPage() {
    const baseUrl = 'https://www.devolverdigital.com/propaganda';
    const { page, destroy } = await getPlaywrightPage(baseUrl, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (route.request().resourceType() === 'document' ? route.continue() : route.abort()));
        },
    });
    try {
        await page.waitForSelector('.cms-content', { state: 'attached' });
        const response = await page.content();
        const $ = load(response);
        const items: DataItem[] = $('.cms-content')
            .toArray()
            .map((content) => {
                const $post = $(content).parent();
                const $title = $post.find('h1');
                const link = $post.find('a[href^="https://www.devolverdigital.com/propaganda/"]').attr('href');
                if (!link) {
                    throw new Error('Devolver Digital article permalink was not found');
                }
                parsePostImages($, content);
                return {
                    title: $title.text(),
                    link,
                    category: [$title.prev().children().first().text()],
                    author: $title.next().text().replace(/^By /, ''),
                    pubDate: timezone(parseDate($title.prev().children().last().text(), 'MMMM D, YYYY'), 0),
                    description: $(content).html(),
                };
            });
        return items;
    } finally {
        await destroy();
    }
}

function parsePostImages($, content) {
    $(content)
        .find('img')
        .each((index, img) => {
            const $img = $(img);
            const src = $img.attr('src') || '';
            if (src.startsWith('/_next/image')) {
                const srcSet = $img.attr('srcset') || '';
                const actualSrc = srcSet.split(',').pop()?.split(' ', 1)[0] || src;
                $img.attr('src', actualSrc);
            }
            $img.removeAttr('loading').removeAttr('decoding').removeAttr('data-nimg').removeAttr('style').removeAttr('sizes').removeAttr('srcset').removeAttr('referrerpolicy');
        });
}
