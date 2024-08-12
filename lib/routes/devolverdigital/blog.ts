import { Route } from '@/types';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';

export const route: Route = {
    path: '/blog',
    categories: ['game'],
    example: '/devolverdigital/blog',
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
            source: ['devolverdigital.com/blog'],
        },
    ],
    name: 'Official Blogs',
    maintainers: ['XXY233'],
    handler,
    url: 'devolverdigital.com/blog',
};

async function handler() {
    const items = await fetchPage(1);

    return {
        title: 'DevolverDigital Blog',
        language: 'en-us',
        link: 'https://www.devolverdigital.com/blog',
        item: items,
    };
}

async function fetchPage(pageNumger: number, items: any[] = []): Promise<any[]> {
    const baseUrl = 'https://www.devolverdigital.com/blog?page=' + pageNumger;
    const response = await ofetch(baseUrl);
    const $ = load(response, { scriptingEnabled: false });

    // Extract all posts of this page
    const $titleDivs = $('div.w-full.flex.justify-center.py-4.bg-red-400.undefined');
    const $contentDivs = $('div.bg-gray-800.flex.justify-center.font-sm.py-4');
    if ($titleDivs.length === 0 && $contentDivs.length === 0) {
        return items;
    }

    $titleDivs.each((index, titleDiv) => {
        const content = $contentDivs[index];

        const $postAuthorElement = $(titleDiv).find('div.font-xs.leading-none.mb-1');
        const postAuthor: string = $postAuthorElement.text().replace('By ', '') || 'Devolver Digital';
        const postDate = parseDate($(titleDiv).find('div.font-2xs.leading-none.mb-1').text());
        const postTitle = $(titleDiv).find('h1').text();
        const postLink = $(content).find('div.ml-auto.flex.items-center a').attr('href');
        // Modify the src attribute of the image
        parseImages($, content);
        const postContent = $.html($(content).find('div.cms-content'));
        items.push({
            title: postTitle,
            link: postLink,
            author: postAuthor,
            pubDate: postDate,
            description: postContent,
        });
    });

    // Checks if the next page exists.
    const $nextPage = $('span.flex.items-center:not(.opacity-50)');
    const hasNextPage = $nextPage.length === 1 && $nextPage.text().includes('Older');
    if (hasNextPage) {
        return fetchPage(pageNumger + 1, items);
    }

    return items;
}

function parseDate(dateStr) {
    const cleanedDateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
    const parsedDate = new Date(cleanedDateStr);

    if (Number.isNaN(parsedDate)) {
        return new Date();
    }

    return parsedDate;
}

function parseImages($, content) {
    $(content)
        .find('img')
        .each((index, img) => {
            const $img = $(img);
            const src = $img.attr('src') || '';
            if (src.startsWith('/_next/image')) {
                const srcSet = $img.attr('srcset') || '';
                const actualSrc = srcSet.split(',').pop()?.split(' ')[0] || src;
                $img.attr('src', actualSrc);
            }
            $img.removeAttr('loading').removeAttr('decoding').removeAttr('data-nimg').removeAttr('style').removeAttr('sizes').removeAttr('srcset').removeAttr('referrerpolicy');
        });
}
