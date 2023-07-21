const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const md5 = require('@/utils/md5');

const baseUrl = 'https://www.techpowerup.com';

const headers = {
    cookie: `botcheck=${md5(Date.now().toString())}`,
};

const fixImages = ($) => {
    $('div.responsive-image-xx').each((_, d) => {
        removeResponsiveStyle(d);
    });
    $('figure').each((_, f) => {
        removeFigureStyle(f);
    });
    $('.newspost img').each((_, img) => {
        hdImage(img);
    });
};

const hdImage = (img) => {
    img.attribs.src = img.attribs.src.replace('_thm', '').replace('_small', '');
    if (img.parentNode.name === 'a' && img.parentNode.attribs['data-width'] && img.parentNode.attribs['data-height']) {
        img.attribs.width = img.parentNode.attribs['data-width'];
        img.attribs.height = img.parentNode.attribs['data-height'];
    }
};
const removeFigureStyle = (f) => {
    delete f.attribs.style;
};

const removeResponsiveStyle = (div) => {
    delete div.attribs.style;
};

const parseReviews = async ($, item) => {
    const { review } = JSON.parse($('script[type="application/ld+json"]').text());

    const content = $('.text');
    const nextPages = $('#pagesel option')
        .toArray()
        .map((a) => `${baseUrl}${a.attribs.value}`)
        .slice(1, -1);

    if (nextPages.length) {
        const pages = await Promise.all(
            nextPages.map(async (url) => {
                const { data: response } = await got(url, {
                    headers,
                });
                const $ = cheerio.load(response);
                $('.text div.responsive-image-xx').each((_, d) => {
                    removeResponsiveStyle(d);
                });
                $('.text figure').each((_, f) => {
                    removeFigureStyle(f);
                });
                $('.text img').each((_, img) => {
                    hdImage(img);
                });
                return $('.text').html();
            })
        );
        content.append(pages);
    }

    item.author = review.author.name;
    item.pubDate = parseDate(review.datePublished);
    item.updated = parseDate(review.dateModified);
    item.description = content.html();
};

module.exports = {
    baseUrl,
    headers,
    fixImages,
    hdImage,
    parseReviews,
    removeFigureStyle,
    removeResponsiveStyle,
};
