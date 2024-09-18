import { DataItem, Route } from '@/types';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/devtrium/',
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
            source: ['devtrium.com'],
        },
    ],
    name: 'Official Blogs',
    maintainers: ['Xy2002'],
    handler,
    url: 'devtrium.com',
};

async function handler() {
    const items = await fetchPage();

    return {
        title: 'Devtrium',
        language: 'en-us',
        item: items,
        link: 'https://devtrium.com',
    };
}

async function fetchPage() {
    const baseUrl = 'https://devtrium.com/';
    const response = await ofetch(baseUrl);
    const $ = load(response, { scriptingEnabled: false });

    // Extract all posts of this page
    const $postDivs = $(String.raw`main > div.grid.max-w-5xl.grid-cols-1.px-8.py-4.mx-auto.text-left.gap-14.md\:grid-cols-2.sm\:text-justify > a`);
    const items: DataItem[] = $postDivs.toArray().map((postDiv) => {
        const postTitle = $(postDiv).find('h2').text();
        const postDescription = $(postDiv).find('p').text();
        const postLink = baseUrl + $(postDiv).attr('href');
        const postPubDate = parseDate($(postDiv).find('footer').text());
        return {
            title: postTitle,
            link: postLink,
            description: postDescription,
            pubDate: postPubDate,
        };
    });
    return items;
    // const $titleDivs = $('div.w-full.flex.justify-center.py-4.bg-red-400.undefined');
    // const $contentDivs = $('div.bg-gray-800.flex.justify-center.font-sm.py-4');
    // const items: DataItem[] = $titleDivs.toArray().map((titleDiv, index) => {
    //     const content = $contentDivs[index];
    //     const postAuthor = parsePostAuthor($, titleDiv);
    //     const postDate = parsePostDate($, titleDiv);
    //     const postTitle = $(titleDiv).find('h1').text();
    //     const postLink = $(content).find('div.ml-auto.flex.items-center a').attr('href');
    //     // Modify the src attribute of the image
    //     parsePostImages($, content);
    //     const postContent = $.html($(content).find('div.cms-content'));
    //     return {
    //         title: postTitle,
    //         link: postLink,
    //         author: postAuthor,
    //         pubDate: postDate,
    //         description: postContent,
    //     };
    // });

    // return items;
}
