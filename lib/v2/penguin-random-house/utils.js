const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const parseBookInList = (element) => {
    const $ = cheerio.load(element);
    const title = $('h2').first().text();
    const author = $('h2.author').first().text();
    const description = $('.desc').first().text();
    let imageSrc = $('img.cover__backcover').attr('src');
    let imageAlt = $('img.cover__backcover').attr('alt');
    if (!imageSrc) {
        imageSrc = $('img.img-responsive').attr('data-src');
        imageAlt = $('img.img-responsive').attr('alt');
    }

    return art(path.join(__dirname, 'templates/book.art'), {
        title,
        author,
        description,
        imageSrc,
        imageAlt,
    });
};

const parsePubDate = (data) => {
    const dateString = data('script')
        .get()
        .filter((element) => {
            const fullString = element.children[0];
            if (!fullString || !fullString.data) {
                return false;
            }
            return fullString.data.includes('post_date');
        })[0];
    if (dateString.length === 0) {
        return;
    }

    const dateMatch = dateString.children[0].data.match(/(?<="post_date":").*?(?=")/);
    if (!dateMatch) {
        return;
    }

    return parseDate(dateMatch[0]);
};

const parseBooks = (element) => {
    const $ = cheerio.load(element);
    const description = $('h2.read-down-text').first().html();
    let mainBlock = '';

    $('.awesome-list>li').map((i, element) => {
        const appending = parseBookInList(element);
        mainBlock += appending;
        return appending;
    });

    return {
        description,
        content: mainBlock,
        pubDate: parsePubDate($),
    };
};

const parseArticle = (element) => {
    const $ = cheerio.load(element);
    const description = $('h2.hdr-smalltxt').first().html();
    const imageSrc = $('div.img-block>img').first().attr('src');
    const imageAlt = $('div.img-block>img').first().attr('alt');
    let mainBlock = '';

    const descriptionBlock = art(path.join(__dirname, 'templates/articleHeader.art'), {
        description,
        imageSrc,
        imageAlt,
    });

    $('div.main-content>p,div.main-content>ul').map((i, element) => {
        const appending = cheerio.load(element);
        mainBlock += appending.html();
        return appending;
    });

    return {
        description: descriptionBlock,
        content: mainBlock,
        pubDate: parsePubDate($),
    };
};

const parseList = (items, ctx, contentParser) =>
    Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.url, async () => {
                const itemRes = await got(item.url);

                const itemPage = itemRes.data;
                const itemParsed = contentParser(itemPage);

                const result = {
                    title: item.title,
                    description: itemParsed.description + '<br>' + itemParsed.content,
                    pubDate: itemParsed.pubDate,
                    link: item.url,
                };

                return result;
            })
        )
    );

module.exports = {
    parseList,
    parseBooks,
    parseArticle,
};
