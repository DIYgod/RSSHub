import { Route } from '@/types';

import cache from '@/utils/cache';
import { load } from 'cheerio';
import path from 'node:path';

import got from '@/utils/got';
import { art } from '@/utils/render';

const baseURL = 'https://freecomputerbooks.com/';

async function cheerioLoad(url) {
    return load((await got(url)).data);
}

export const route: Route = {
    path: '/:category?',
    name: 'Book List',
    url: new URL(baseURL).host,
    maintainers: ['cubroe'],
    handler,
    example: '/freecomputerbooks/compscAlgorithmBooks',
    parameters: {
        category: 'A category id., which should be the HTML file name (but **without** the `.html` suffix) in the URL path of a book list page.',
    },
    categories: ['reading'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['freecomputerbooks.com/', 'freecomputerbooks.com/index.html'],
            target: '',
        },
    ],
};

async function handler(ctx) {
    const categoryId = ctx.req.param('category')?.trim();
    const requestURL = categoryId ? new URL(`${categoryId}.html`, baseURL).href : baseURL;
    const $ = await cheerioLoad(requestURL);

    // As observation has shown that each page only has one element of the
    // class, thus to simplify the processing the text is directly extracted.
    // Needing more robust processing if some day more such elements show up.
    const categoryTitle = $('.maintitlebar').text();

    return {
        title: 'Free Computer Books - ' + categoryTitle,
        link: requestURL,
        description: $('title').text(),

        // For a "Selected New Books" page, the <ul> element's id. is
        // `newBooksG`; for an ordinary category page, it's `newBooksL`.
        item: await Promise.all(
            $('ul[id^=newBooks] > li')
                .toArray()
                .map((elem) => buildPostItem($(elem), categoryTitle, cache))
        ),
    };
}

function buildPostItem(listItem, categoryTitle, cache) {
    const $ = load(''); // the only use below doesn't care about the content

    const postLink = listItem.find('a:first');
    const postInfo = listItem.find('p:contains("Post under")');
    const postItem = {
        title: postLink.text(),
        link: new URL(postLink.attr('href'), baseURL).href,

        // Only a "Selected New Books" page has exclicit categorization info.
        // for posts; an ordinary category page hasn't, then in which case the
        // category title is used (after all, it's already a *category page*).
        category: postInfo.length
            ? postInfo
                  .find('a')
                  .toArray()
                  .map((elem) => $(elem).text())
            : categoryTitle,
    };

    return cache.tryGet(postItem.link, () => insertDescriptionInto(postItem));
}

async function insertDescriptionInto(item) {
    const $ = await cheerioLoad(item.link);

    // Eliminate all comment nodes to avoid their being selected and rendered in
    // the final output (I know this is actually unnecessary, but please forgive
    // my mysophobia).
    $.root()
        .find('*')
        .contents()
        .filter((_, node) => node.type === 'comment')
        .remove();

    const imageURL = $('#bookdesc img[title]').attr('src');
    const metadata = $('#booktitle ul').removeAttr('style');
    const content = $('#bookdesccontent').removeAttr('id');

    metadata.find('li:contains(Share This)').remove();
    content.find('img[src$="/hot.gif"]').remove();
    content.find(':contains(Similar Books)').nextAll().addBack().remove();

    item.description = art(path.join(__dirname, 'templates/desc.art'), { imageURL, metadata, content });

    return item;
}
