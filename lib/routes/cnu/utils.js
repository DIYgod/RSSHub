const cheerio = require('cheerio');

const pic_base_url = 'http://imgoss.cnu.cc/';

const parseContent = (htmlString) => {
    const $ = cheerio.load(htmlString);

    const author = $('.author-info > a');
    const time = $('.author-info > .timeago');
    const content = $('#work_body');

    const imgs_json = JSON.parse($('#imgs_json').text());
    for (const element of imgs_json) {
        content.append(`<img src="${pic_base_url}${element.img}" />`);
        content.append(`<div class='img_description'>${element.content}</div>`);
        content.append(`<p>${element.text}</p>`);
    }

    return {
        author: author.text().trim(),
        description: content.html(),
        pubDate: new Date(time.text().trim()),
    };
};

module.exports = {
    parseContent,
};
