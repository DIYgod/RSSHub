const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const resolveRelativeLink = (link, baseUrl) => (link.startsWith('http') ? link : `${baseUrl}${link}`);

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'china';
    const keyword = ctx.params.keyword === 'RSS' ? 'rss' : ctx.params.keyword ?? '';

    // raise error for invalid languages
    if (!['china', 'tchina'].includes(language)) {
        throw Error('Invalid language');
    }

    const rootUrl = `https://${language}.kyodonews.net`;
    const currentUrl = `${rootUrl}/${keyword ? (keyword === 'rss' ? 'rss/news.xml' : `news/${keyword}`) : ''}`;

    let response;
    try {
        response = await got(currentUrl);
    } catch (e) {
        throw e.response && e.response.statusCode === 404 ? new Error('Invalid keyword') : e;
    }

    const $ = cheerio.load(response.data, { xmlMode: keyword === 'rss' });

    let title, description, image, items;
    image = `${rootUrl}/apple-touch-icon-180x180.png`;

    if (keyword === 'rss') {
        title = $('channel > title').text();
        description = $('channel > description').text();
        items = $('item')
            .map((_, item) => {
                const $item = $(item);
                const link = $item.find('link').text();
                // const pubDate = $item.find('pubDate').text();
                return {
                    link,
                    // pubDate,  // no need to normalize because it's from a valid RSS feed
                };
            })
            .get();
    } else {
        title = $('head > title').text();
        description = $('meta[name="description"]').attr('content');
        image = resolveRelativeLink($('head > link[rel="apple-touch-icon"]').attr('href'), rootUrl) || image;
        items = $('div.sec-latest > ul > li')
            .map((_, item) => {
                item = $(item);
                const link = item.find('a').attr('href');
                return {
                    link: resolveRelativeLink(link, rootUrl),
                };
            })
            .get();
    }

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);

                const $ = cheerio.load(detailResponse.data);
                item.title = $('head > title').text();
                item.author = $('meta[name="author"]').attr('content');

                // add main pic
                const mainPicArea = $('div.mainpic');
                mainPicArea.find('div').each((_, elem) => {
                    elem = $(elem);
                    elem.css('text-align', 'center');
                });
                // moving `data-src` to `src`
                mainPicArea.find('img').each((_, img) => {
                    img = $(img);
                    img.attr('src', img.attr('data-src'));
                    img.removeAttr('data-src');
                    img.wrap('<div>');
                });
                let mainPic = mainPicArea.html();
                mainPic = mainPic ? mainPic.trim() : '';

                // add article body
                let articleBody = $('div.article-body').html();
                articleBody = articleBody ? articleBody.trim().replace(/（完）(?=<\/p>\s*$)/m, '') : '';

                // render description
                item.description = art(path.join(__dirname, 'templates/article.art'), {
                    mainPic,
                    articleBody,
                });

                const ldJson = $('script[type="application/ld+json"]').html();
                const pubDate_match = ldJson && ldJson.match(/"datePublished":"([\d\s-:]*?)"/);
                const updated_match = ldJson && ldJson.match(/"dateModified":"([\d\s-:]*?)"/);
                if (pubDate_match) {
                    item.pubDate = timezone(parseDate(pubDate_match[1]), 9);
                }
                if (updated_match) {
                    item.updated = timezone(parseDate(updated_match[1]), 9);
                }

                item.category = $('p.credit > a')
                    .map((_, a) => $(a).text())
                    .get();
                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        description,
        link: currentUrl,
        item: items,
        image,
    };
};
