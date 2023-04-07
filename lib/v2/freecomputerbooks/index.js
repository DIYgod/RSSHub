const cheerio = require('cheerio');

const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const baseURL = 'https://freecomputerbooks.com/';

module.exports = async (ctx) => {
    const categoryId = ctx.params.category?.trim();
    const requestURL = categoryId ? new URL(`${categoryId}.html`, baseURL).href : baseURL;

    const response = await got({ method: 'get', url: requestURL });
    const $ = cheerio.load(response.data);

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
        item: $('ul[id^=newBooks] > li')
            .toArray()
            .map((elem) => buildPostItem($(elem), categoryTitle, $)),
    };
};

function buildPostItem(listItem, categoryTitle, $) {
    // Cover in original size, e.g., `covers/xyz_43x55.jpg` -> `covers/xyz.jpg`
    const image = listItem.find('img');
    image.attr('src', image.attr('src').replace(/_\d+x\d+/, ''));

    const postLink = listItem.find('a:first');
    const postInfo = listItem.find('p:contains("Post under")');
    const postItem = {
        title: postLink.text(),
        link: postLink.attr('href'),
        description: listItem.html(),

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

    return postItem;
}
