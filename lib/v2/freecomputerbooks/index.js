const cheerio = require('cheerio');
const path = require('path');

const got = require('@/utils/got');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

const baseURL = 'https://freecomputerbooks.com/';

async function cheerioLoad(url) {
    return cheerio.load((await got(url)).data);
}

module.exports = async (ctx) => {
    const categoryId = ctx.params.category?.trim();
    const requestURL = categoryId ? new URL(`${categoryId}.html`, baseURL).href : baseURL;
    const $ = await cheerioLoad(requestURL);

    // As observation has shown that each page only has one element of the
    // class, thus to simplify the processing the text is directly extracted.
    // Needing more robust processing if some day more such elements show up.
    const categoryTitle = $('.maintitlebar').text();

    ctx.state.data = {
        title: 'Free Computer Books - ' + categoryTitle,
        link: requestURL,
        description: $('title').text(),

        // For a "Selected New Books" page, the <ul> element's id. is
        // `newBooksG`; for an ordinary category page, it's `newBooksL`.
        item: await Promise.all(
            $('ul[id^=newBooks] > li')
                .toArray()
                .map((elem) => buildPostItem($(elem), categoryTitle, ctx.cache))
        ),
    };
};

function buildPostItem(listItem, categoryTitle, cache) {
    const $ = cheerio.load(''); // the only use below doesn't care about the content

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

    const pubDateText = postInfo.find('span:last').text().replace(/^on /, '');
    if (pubDateText) {
        // Pretty much the same situation: Only a "Selected New Books" page has
        // explicit publication dates for posts; even on each post's details
        // page, there seems to be only the publication date for the book, but
        // the post's creation date is still missing.
        postItem.pubDate = parseDate(pubDateText);
    }

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
