const cheerio = require('cheerio');

const ProcessImage = ($, e) => {
    const photo = $(e).find('figure');

    let cover = `<figure><img src='${photo[0].attribs.itemid}'><br><figcaption>`;

    const caption = $(e).find('figcaption');

    cover += `${$(caption[0])
        .text()
        .trim()}</figcaption></figure>`;

    return cover;
};

const ProcessFeed = (data, hasEnVersion = false) => {
    const $ = cheerio.load(data);

    let content;
    const result = {};

    // 处理 www.nytimes.com
    if (hasEnVersion) {
        content = $('section[name="articleBody"]');
        result.title = `「英」${$('h1')
            .text()
            .trim()}`;
        result.author = $('article#story span[itemprop="name"]').text();

        // 处理封面图片
        $('article#story > header')
            .find('div[data-testid="photoviewer-wrapper"]')
            .each((i, e) => {
                const cover = ProcessImage($, e);

                $(cover).insertBefore(content[0].firstChild);
            });

        // 处理图片
        content.find('div[data-testid="photoviewer-wrapper"]').each((i, e) => {
            const cover = ProcessImage($, e);
            $(cover).insertBefore(e);
            $(e).remove();
        });

        // remove useless DOMs
        content.find('aside').each((i, e) => {
            $(e).remove();
        });
    }
    // 处理 cn.nytimes.com
    else {
        content = $('section.article-body');

        // remove useless DOMs
        content.find('div.big_ad, div.article-body-aside').each((i, e) => {
            $(e).remove();
        });

        if ($('figure.article-span-photo').length > 0) {
            // there is a cover photo
            const cover = $('figure.article-span-photo');
            $(cover).insertBefore(content[0].firstChild);
        }

        if ($('footer.author-info').length > 0) {
            // credit to original author and translators
            const footer = $('footer.author-info');
            $(footer).insertAfter(content[0].lastChild);
        }
    }

    const time = $('time').attr('datetime');
    if (time) {
        result.pubDate = new Date(time).toUTCString();
    }

    result.description = content.html();

    return result;
};

module.exports = {
    ProcessFeed,
};
