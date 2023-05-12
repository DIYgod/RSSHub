const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = require('@/config').value;

async function parse(url, cookie = '') {
    const { data } = await got(url, {
        headers: {
            cookie,
        },
    });
    const $ = cheerio.load(data);

    const publishedTime = $('meta[property="article:published_time"]').attr('content');
    const author = $('meta[name="author"]').attr('content');

    const article = $('body article');

    // remove header actions
    article.find('header').remove();

    // get and remove title
    const title = article.find('h1').first();
    const titleText = title.text();
    title.remove(); // remove title from html

    // get subtitle and remove author actions
    const subtitle = article.find('.pw-subtitle-paragraph');
    const subtitleText = subtitle.text();
    if (subtitle.length !== 0) {
        // preserve subtitle in html
        subtitle.siblings().remove();
    } else {
        // no subtitle
        article.find('.pw-post-body-paragraph').siblings().first().remove();
    }

    return {
        title: titleText,
        subtitle: subtitleText,
        author,
        publishedTime,
        html: article.html(),
        url,
    };
}

module.exports = function (ctx, url) {
    return ctx.cache.tryGet(`medium:article:${url}`, async () => {
        const { title, author, publishedTime, html } = await parse(url, config.medium.articleCookie);

        return {
            title,
            author,
            link: url,
            description: html,
            pubDate: publishedTime,
        };
    });
};
